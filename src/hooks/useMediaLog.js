import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  deleteDoc, 
  doc, 
  updateDoc // <-- Precisamos dessa função para editar
} from 'firebase/firestore';

export const useMediaLog = () => {
  const logCollectionRef = collection(db, "logs"); // Nome exato da sua coleção

  const saveMedia = async (mediaData, rating, review, status) => {
    try {
      if (!auth.currentUser) throw new Error("Usuário não autenticado");
      await addDoc(logCollectionRef, {
        userId: auth.currentUser.uid,
        externalId: String(mediaData.id),
        mediaType: mediaData.type,
        titleSnapshot: mediaData.title,
        imageSnapshot: mediaData.image,
        rating: Number(rating),
        review: review,
        status: status,
        createdAt: serverTimestamp(),
      });
     // alert("Salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const getUserLogs = async () => {
    if (!auth.currentUser) return [];
    const q = query(logCollectionRef, where("userId", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  };

  const deleteMedia = async (docId) => {
    try {
      await deleteDoc(doc(db, "logs", docId));
      alert("Removido com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  // FUNÇÃO DE EDIÇÃO CORRIGIDA
  const updateMedia = async (id, newRating, newReview, newStatus) => {
    try {
      const docRef = doc(db, "logs", id); // Usando "logs" em vez de "mediaLogs"
      await updateDoc(docRef, {
        rating: Number(newRating),
        review: newReview,
        status: newStatus,
        updatedAt: serverTimestamp() // Adiciona uma marca de tempo da edição
      });
    } catch (error) {
      console.error("Erro ao atualizar no Firebase:", error);
      alert("Erro ao salvar as alterações.");
    }
  };

  return { saveMedia, getUserLogs, deleteMedia, updateMedia };
};