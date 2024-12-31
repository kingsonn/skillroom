'use client';

import { useRef } from 'react';

const addTextWithShadow = (ctx, text, x, y, mainColor, shadowColor = 'rgba(0,0,0,0.3)', shadowBlur = 4) => {
  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.fillStyle = mainColor;
  ctx.fillText(text, x, y);
  ctx.restore();
};

const createGradientText = (ctx, text, x, y, color1, color2) => {
  const gradient = ctx.createLinearGradient(x - ctx.measureText(text).width / 2, y, x + ctx.measureText(text).width / 2, y);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillText(text, x, y);
};

export const generateCertificate = async (cert, userName) => {
  console.log('Generating certificate:', { cert, userName });
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 1920;
    canvas.height = 1080;
    
    const img = new Image();
    img.src = '/certificate-template.png';
    console.log('Loading image from:', img.src);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          console.log('Image loaded successfully');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Configure default text settings
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Add date in top left corner
          ctx.textAlign = 'left'; // Temporarily change alignment for date
          ctx.font = '20px "Press Start 2P"'; // Slightly smaller font
          const date = new Date(cert.issueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          addTextWithShadow(ctx, date, 50, 50, '#4a5568'); // Moved to 50,50 instead of 100,100
          
          // Reset text alignment to center for other elements
          ctx.textAlign = 'center';
          
          // Add name with special styling
          ctx.font = 'bold 64px "Press Start 2P"';
          const nameGradient = ctx.createLinearGradient(
            canvas.width / 2 - 200,
            canvas.height / 2,
            canvas.width / 2 + 200,
            canvas.height / 2
          );
          nameGradient.addColorStop(0, '#4a148c');  // Deep purple
          nameGradient.addColorStop(0.5, '#7b1fa2'); // Purple
          nameGradient.addColorStop(1, '#4a148c');  // Deep purple
          
          addTextWithShadow(ctx, userName || 'Player One', canvas.width / 2, canvas.height / 2 - 50, nameGradient, 'rgba(0,0,0,0.4)', 8);
          
          // Add certificate name with glowing effect
          ctx.font = 'bold 48px "Press Start 2P"';
          ctx.shadowColor = cert.badgeColor || '#ffd700';
          ctx.shadowBlur = 15;
          addTextWithShadow(ctx, cert.name, canvas.width / 2, canvas.height / 2 + 50, '#2c387e', cert.badgeColor || 'rgba(255,215,0,0.5)', 15);
          
          // Add "SKILLS ACQUIRED" text
          ctx.font = '32px "Press Start 2P"';
          addTextWithShadow(ctx, '⚔️ SKILLS ACQUIRED ⚔️', canvas.width / 2, canvas.height / 2 + 160, '#2c387e');
          
          // Add skills in a more stylized way
          ctx.font = 'bold 24px "Press Start 2P"';
          cert.skills.forEach((skill, index) => {
            const xOffset = (index % 3 - 1) * 250;
            const yOffset = Math.floor(index / 3) * 50;
            const x = canvas.width / 2 + xOffset;
            const y = canvas.height / 2 + 240 + yOffset;
            
            // Add skill icon based on type
            const skillIcon = '🎯 ';
            addTextWithShadow(ctx, skillIcon + skill, x, y, '#4a5568', 'rgba(0,0,0,0.2)', 4);
          });
          
          // Add rarity level with special effects
          ctx.font = 'bold 36px "Press Start 2P"';
          const rarityText = `${cert.rarity.toUpperCase()} ACHIEVEMENT`;
          ctx.shadowColor = cert.badgeColor || '#ffd700';
          ctx.shadowBlur = 20;
          createGradientText(ctx, rarityText, canvas.width / 2, canvas.height - 200, '#ffd700', '#ff6b6b');
          
          // Add unique token ID in bottom right
          ctx.textAlign = 'right'; // Change alignment for token ID
          ctx.font = '16px "Press Start 2P"';
          addTextWithShadow(ctx, `#${cert.tokenId}`, canvas.width - 100, canvas.height - 50, '#718096');
          
          console.log('Certificate generated successfully');
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (error) {
          console.error('Error generating certificate:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading certificate template:', error);
        reject(new Error('Failed to load certificate template'));
      };
    });
  } catch (error) {
    console.error('Error in certificate generation:', error);
    throw error;
  }
};

export const downloadCertificate = async (cert, userName) => {
  try {
    console.log('Starting certificate download process');
    const dataUrl = await generateCertificate(cert, userName);
    console.log('Generated certificate data URL');
    
    const link = document.createElement('a');
    link.download = `${cert.name.toLowerCase().replace(/\s+/g, '-')}-certificate.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('Download initiated');
  } catch (error) {
    console.error('Error downloading certificate:', error);
    alert('Failed to generate certificate. Please try again.');
  }
};
