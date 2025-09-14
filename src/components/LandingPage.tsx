import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../styles/GlobalStyles';
import { MessageCircle, Users, Video, Phone } from 'lucide-react';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #5865f2 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ContentWrapper = styled.div`
  display: flex;
  max-width: 1200px;
  width: 100%;
  gap: 60px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const HeroSection = styled.div`
  flex: 1;
  color: white;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 2.5rem;
    text-align: center;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;

  @media (max-width: 768px) {
    text-align: center;
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
  gap: 15px;
  font-size: 1.1rem;

  svg {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 8px;
    border-radius: 8px;
  }
`;

const AuthContainer = styled.div`
  width: 400px;
  max-width: 100%;
`;

const AuthCard = styled(Card)`
  background-color: white;
  color: #2c2f33;
`;

const AuthTabs = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
`;

interface AuthTabProps {
  active: boolean;
}

const AuthTab = styled.button<AuthTabProps>`
  flex: 1;
  padding: 12px;
  border: none;
  background-color: ${({ active }) => active ? '#5865f2' : 'transparent'};
  color: ${({ active }) => active ? 'white' : '#666'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ active }) => active ? '#4752c4' : '#e0e0e0'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
`;

const StyledInput = styled(Input)`
  background-color: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;

  &:focus {
    background-color: white;
    border-color: #5865f2;
  }

  &::placeholder {
    color: #9ca3af;
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

              <Button type="submit" disabled={loading}>
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
