export function drawHands(ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) {
    landmarks.forEach(hand => {
      // Draw landmarks
      ctx.fillStyle = '#FF0000';
      hand.forEach((landmark: any) => {
        ctx.beginPath();
        ctx.arc(
          landmark.x * width,
          landmark.y * height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    });
  }
  
  export function isHandNearMouth(landmarks: any[]): boolean {
    if (landmarks.length === 0) return false;
    
    // Simplified check - just see if any landmark is in upper half of screen
    return landmarks.some(hand => 
      hand.some((landmark: any) => landmark.y < 0.5)
    );
  }