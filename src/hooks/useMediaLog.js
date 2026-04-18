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
        apiId: String(mediaData.id),
        mediaType: mediaData.type,
        titleSnapshot: mediaData.title,
        imageSnapshot: mediaData.image,
        // --- NOVOS DADOS AQUI ---
        releaseDate: mediaData.date || "", 
        genres: mediaData.genres || [],    
        // ------------------------
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

const checkIfMediaExists = async (apiId) => {
  if (!auth.currentUser) return false;
  
  const idStr = String(apiId);

  // Criamos duas consultas: uma para o padrão novo e outra para o antigo
  const qNew = query(logCollectionRef, where("userId", "==", auth.currentUser.uid), where("apiId", "==", idStr));
  const qOld = query(logCollectionRef, where("userId", "==", auth.currentUser.uid), where("externalId", "==", idStr));
  
  const [resNew, resOld] = await Promise.all([getDocs(qNew), getDocs(qOld)]);
  
  return !resNew.empty || !resOld.empty;
};

  // Não esqueça de adicionar ao return do hook:
  return { saveMedia, getUserLogs, deleteMedia, updateMedia, checkIfMediaExists };
};