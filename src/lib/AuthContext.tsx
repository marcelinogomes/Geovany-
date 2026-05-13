import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

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
          
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const currentProfile = userDoc.data() as UserProfile;
            
            if (isBootstrappedAdmin && currentProfile.role !== 'admin') {
              // Upgrade existing student to admin if they are the bootstrapped admin
              const updatedProfile: UserProfile = { 
                ...currentProfile, 
                role: 'admin',
                goal: currentProfile.goal || '',
                weight: currentProfile.weight || 0,
                height: currentProfile.height || 0,
                photoURL: currentProfile.photoURL || user.photoURL || ''
              };
              await setDoc(doc(db, 'users', user.uid), updatedProfile);
              setProfile(updatedProfile);
            } else {
              setProfile(currentProfile);
            }
          } else {
            // New user registration (default to student)
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email!,
              displayName: user.displayName || 'Aluno',
              role: isBootstrappedAdmin ? 'admin' : 'student',
              photoURL: user.photoURL || '',
              goal: '',
              weight: 0,
              height: 0,
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching/updating profile:', error);
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
