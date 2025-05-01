import { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../data/firebase";
import { doc, getDoc } from "firebase/firestore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.uid) {
                try {
                    const docSnap = await getDoc(doc(db, "usuarios", user.uid));
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData({
                            uid: user.uid,
                            apellido: data.apellido || "",
                            nombre: data.nombre || "",
                            email: data.email || "",
                            telefono: data.telefono || "",
                            creadoEn: data.creadoEn || null,
                        });
                    }
                } catch (err) {
                    console.error("Error al obtener datos del usuario:", err);
                }
            } else {
                setUserData(null);
            }
            setIsLoadingAuth(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ userData, isLoadingAuth }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
