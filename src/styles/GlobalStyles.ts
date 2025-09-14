import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #36393f;
    color: #dcddde;
    overflow: hidden;
  }

  html, body, #root {
    height: 100%;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #2f3136;
  }

  ::-webkit-scrollbar-thumb {
    background: #5865f2;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #4752c4;
  }
`;

export const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const MainContainer = styled.div`
  display: flex;
  height: 100vh;
`;

export const Sidebar = styled.div`
  width: 300px;
  background-color: #2f3136;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #202225;
`;

export const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #36393f;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: #5865f2;
          color: white;
          &:hover {
            background-color: #4752c4;
          }
        `;
      case 'secondary':
        return `
          background-color: #4f545c;
          color: #dcddde;
          &:hover {
            background-color: #5c6370;
          }
        `;
      case 'danger':
        return `
          background-color: #ed4245;
          color: white;
          &:hover {
            background-color: #c53638;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: #40444b;
  color: #dcddde;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    background-color: #484c52;
  }

  &::placeholder {
    color: #72767d;
  }
`;

export const Card = styled.div`
  background-color: #40444b;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

interface AvatarProps {
  size?: number;
  src?: string;
}

export const Avatar = styled.div<AvatarProps>`
  width: ${({ size = 40 }) => size}px;
  height: ${({ size = 40 }) => size}px;
  border-radius: 50%;
  background-color: #5865f2;
  background-image: ${({ src }) => src ? `url(${src})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: ${({ size = 40 }) => size * 0.4}px;
`;

interface StatusIndicatorProps {
  status: 'online' | 'away' | 'busy' | 'offline';
}

export const StatusIndicator = styled.div<StatusIndicatorProps>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #2f3136;
  position: absolute;
  bottom: -2px;
  right: -2px;
  
  ${({ status }) => {
    switch (status) {
      case 'online':
        return 'background-color: #3ba55c;';
      case 'away':
        return 'background-color: #faa61a;';
      case 'busy':
        return 'background-color: #ed4245;';
      case 'offline':
        return 'background-color: #747f8d;';
    }
  }}
`;
