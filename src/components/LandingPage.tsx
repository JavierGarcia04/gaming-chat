import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../styles/GlobalStyles';
import { MessageCircle, Users, Video, Phone } from 'lucide-react';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  max-width: 1400px;
  width: 100%;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 50px;
  }
`;

const HeroSection = styled.div`
  flex: 1;
  color: white;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.1;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    font-size: 2.8rem;
    text-align: center;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 48px;
  opacity: 0.95;
  line-height: 1.7;
  font-weight: 300;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    text-align: center;
    font-size: 1.1rem;
  }
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 1.125rem;
  font-weight: 400;
  opacity: 0.95;
  transition: all 0.3s ease;
  padding: 8px 0;

  &:hover {
    opacity: 1;
    transform: translateX(8px);
  }

  svg {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
    padding: 12px;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

const AuthContainer = styled.div`
  width: 420px;
  max-width: 100%;
`;

const AuthCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
  color: #1f2937;
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const AuthTabs = styled.div`
  display: flex;
  margin-bottom: 32px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f3f4f6;
  padding: 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;

interface AuthTabProps {
  active: boolean;
}

const AuthTab = styled.button<AuthTabProps>`
  flex: 1;
  padding: 14px 20px;
  border: none;
  background-color: ${({ active }) => active ? '#667eea' : 'transparent'};
  color: ${({ active }) => active ? 'white' : '#6b7280'};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  position: relative;

  &:hover {
    background-color: ${({ active }) => active ? '#5a67d8' : '#e5e7eb'};
    color: ${({ active }) => active ? 'white' : '#374151'};
  }

  ${({ active }) => active && `
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  `}
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  letter-spacing: 0.025em;
`;

const StyledInput = styled(Input)`
  background-color: #f9fafb;
  color: #374151;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 15px;
  transition: all 0.3s ease;

  &:focus {
    background-color: white;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:hover {
    border-color: #d1d5db;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  margin-top: 10px;
`;

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          throw new Error('Display name is required');
        }
        await register(email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LandingContainer>
      <ContentWrapper>
        <HeroSection>
          <HeroTitle>Connect & Chat Like Never Before</HeroTitle>
          <HeroSubtitle>
            Join millions of users in the ultimate communication platform. 
            Chat, call, and share with friends in real-time.
          </HeroSubtitle>
          <FeatureList>
            <FeatureItem>
              <MessageCircle size={32} />
              <span>Instant messaging with real-time delivery</span>
            </FeatureItem>
            <FeatureItem>
              <Users size={32} />
              <span>Connect with friends across the globe</span>
            </FeatureItem>
            <FeatureItem>
              <Video size={32} />
              <span>High-quality video calls (coming soon)</span>
            </FeatureItem>
            <FeatureItem>
              <Phone size={32} />
              <span>Crystal clear voice calls (coming soon)</span>
            </FeatureItem>
          </FeatureList>
        </HeroSection>

        <AuthContainer>
          <AuthCard>
            <AuthTabs>
              <AuthTab active={isLogin} onClick={() => setIsLogin(true)}>
                Sign In
              </AuthTab>
              <AuthTab active={!isLogin} onClick={() => setIsLogin(false)}>
                Sign Up
              </AuthTab>
            </AuthTabs>

            <Form onSubmit={handleSubmit}>
              {!isLogin && (
                <FormGroup>
                  <Label>Display Name</Label>
                  <StyledInput
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                    required={!isLogin}
                  />
                </FormGroup>
              )}
              
              <FormGroup>
                <Label>Email</Label>
                <StyledInput
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Password</Label>
                <StyledInput
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                />
              </FormGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <Button 
                type="submit" 
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '15px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  transform: loading ? 'none' : 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </Form>
          </AuthCard>
        </AuthContainer>
      </ContentWrapper>
    </LandingContainer>
  );
};

export default LandingPage;
