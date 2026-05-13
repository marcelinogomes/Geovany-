import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from './utils';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const bootstrappedAdmins = ['geovanymarcelino25@gmail.com', 'mginformatica78@gmail.com'];
          const isBootstrappedAdmin = user.email && bootstrappedAdmins.includes(user.email.toLowerCase());
          
          const userDocRef = doc(db, 'users', user.uid);
          let userDoc = null;
          
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err) {
            console.error('Initial profile fetch failed:', err);
            // If we are a bootstrapped admin, provide a local profile even if DB fails
            if (isBootstrappedAdmin) {
              setProfile({
                uid: user.uid,
                email: user.email!,
                displayName: user.displayName || 'Admin',
                role: 'admin',
                createdAt: null as any
              });
              setLoading(false);
              return;
            }
          }
          
          if (userDoc && userDoc.exists()) {
            const currentProfile = userDoc.data() as UserProfile;
            
            // Auto-upgrade logic for bootstrapped admins
            if (isBootstrappedAdmin && currentProfile.role !== 'admin') {
              const updatedProfile: UserProfile = { 
                ...currentProfile, 
                role: 'admin',
                updatedAt: serverTimestamp()
              };
              await updateDoc(userDocRef, { role: 'admin' }).catch(() => {});
              setProfile(updatedProfile);
            } else {
              setProfile(currentProfile);
            }
          } else if (user) {
            // New user or deleted user profile
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email!,
              displayName: user.displayName || (isBootstrappedAdmin ? 'Admin' : 'Aluno'),
              role: isBootstrappedAdmin ? 'admin' : 'student',
              photoURL: user.photoURL || '',
              goal: '',
              weight: 0,
              height: 0,
              createdAt: serverTimestamp(),
            };
            
            try {
              await setDoc(userDocRef, newProfile);
              setProfile(newProfile);
            } catch (err) {
              // If setDoc fails but we are an admin, still allow login with local profile
              if (isBootstrappedAdmin) {
                setProfile(newProfile);
              } else {
                handleFirestoreError(err, OperationType.CREATE, 'users/' + user.uid);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching/updating profile for UID:', user.uid, error);
          // If Firestore fails but they are a bootstrapped admin, provide a skeleton profile
          const bootstrappedAdmins = ['geovanymarcelino25@gmail.com', 'mginformatica78@gmail.com'];
          const isBootstrappedAdmin = user.email && bootstrappedAdmins.includes(user.email.toLowerCase());
          
          if (isBootstrappedAdmin) {
            setProfile({
              uid: user.uid,
              email: user.email!,
              displayName: user.displayName || 'Admin',
              role: 'admin',
              createdAt: null as any
            });
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin: profile?.role === 'admin' || (user?.email !== undefined && ['geovanymarcelino25@gmail.com', 'mginformatica78@gmail.com'].includes(user.email.toLowerCase()))
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
