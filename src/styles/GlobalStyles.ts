import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
    background: linear-gradient(135deg, #2f3136 0%, #36393f 50%, #3c4043 100%);
    color: #f1f3f4;
    overflow: hidden;
    overscroll-behavior-y: none;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: 'liga', 'kern';
    letter-spacing: -0.01em;
  }

  html, body, #root {
    height: 100%;
    min-height: 100%;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px;
    transition: all 0.2s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    box-shadow: 0 0 8px rgba(102, 126, 234, 0.3);
  }

  /* Custom selection styles */
  ::selection {
    background: rgba(102, 126, 234, 0.3);
    color: #ffffff;
  }

  ::-moz-selection {
    background: rgba(102, 126, 234, 0.3);
    color: #ffffff;
  }
`;

export const Container = styled.div`
  height: 100dvh;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const MainContainer = styled.div`
  display: flex;
  height: 100dvh;
  min-height: 0;
`;

export const Sidebar = styled.div<{ open?: boolean }>`
  width: 320px;
  background: linear-gradient(135deg, #2a2d31 0%, #2f3136 100%);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 0;
  overflow: hidden;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(-100%)')};
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    width: 85vw;
    max-width: 340px;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
  }
`;

export const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #36393f 0%, #3c4043 100%);
  min-height: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.02) 0%, transparent 70%);
    pointer-events: none;
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.025em;
  position: relative;
  overflow: hidden;
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background: rgba(255, 255, 255, 0.1);
          color: #f1f3f4;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          
          &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

export const Input = styled.input`
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #f1f3f4;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-weight: 400;

  &:focus {
    background: rgba(255, 255, 255, 0.12);
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #a0a6b0;
    font-weight: 400;
  }

  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

export const Card = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.15);
  }
`;

interface AvatarProps {
  size?: number;
  src?: string;
}

export const Avatar = styled.div<AvatarProps>`
  width: ${({ size = 40 }) => size}px;
  height: ${({ size = 40 }) => size}px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-image: ${({ src }) => src ? `url(${src})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: ${({ size = 40 }) => size * 0.4}px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
`;

interface StatusIndicatorProps {
  status: 'online' | 'away' | 'busy' | 'offline';
}

export const StatusIndicator = styled.div<StatusIndicatorProps>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid rgba(47, 49, 54, 0.8);
  position: absolute;
  bottom: -2px;
  right: -2px;
  transition: all 0.3s ease;
  
  ${({ status }) => {
    switch (status) {
      case 'online':
        return `
          background-color: #00d26a;
          box-shadow: 0 0 8px rgba(0, 210, 106, 0.4);
        `;
      case 'away':
        return `
          background-color: #fbbf24;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
        `;
      case 'busy':
        return `
          background-color: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        `;
      case 'offline':
        return `
          background-color: #6b7280;
          box-shadow: 0 0 8px rgba(107, 114, 128, 0.4);
        `;
    }
  }}
`;
