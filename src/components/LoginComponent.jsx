import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import toast from 'react-hot-toast';
import '../App.css';

export default function LoginComponent({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLogin(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onLogin(userCredential.user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Por favor, digite seu e-mail no campo acima para recuperar a senha.', {
        icon: '📧',
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada (e o spam).', {
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      if (error.code === 'auth/user-not-found') {
        toast.error('Não encontramos nenhuma conta com este e-mail.');
      } else {
        toast.error('Erro ao enviar e-mail. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isLogin} // A senha não é obrigatória se for só para recuperar o email
          />
          <button type="submit">{isLogin ? 'Entrar' : 'Cadastrar'}</button>
        </form>
        
        {error && <p style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '10px' }}>{error}</p>}
        
        {/* NOVO: Botão de Esqueci a Senha (só aparece no modo Entrar) */}
        {isLogin && (
          <p 
            onClick={handleForgotPassword} 
            style={{
              color: 'var(--lb-green)', 
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'center',
              marginTop: '15px',
              textDecoration: 'underline'
            }}
          >
            Esqueci minha senha
          </p>
        )}

        <button className="login-toggle" onClick={() => {
          setIsLogin(!isLogin);
          setError(''); // Limpa os erros ao trocar de tela
        }}>
          {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
        </button>
      </div>
    </div>
  );
}