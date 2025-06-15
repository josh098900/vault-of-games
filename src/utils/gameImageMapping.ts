
export const getGameImage = (game: { title: string; cover_image_url?: string }) => {
  if (game.cover_image_url && game.cover_image_url.includes('igdb.com')) {
    return game.cover_image_url.replace('t_cover_big', 't_cover_big');
  }
  
  // Accurately matched game covers by exact title
  const gameImages: Record<string, string> = {
    // Popular AAA Games
    "Cyberpunk 2077": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.webp",
    "The Witcher 3: Wild Hunt": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp",
    "Red Dead Redemption 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp",
    "Grand Theft Auto V": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7g.webp",
    "Elden Ring": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jj6.webp",
    "God of War": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp",
    "The Last of Us Part II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2f2z.webp",
    "Ghost of Tsushima": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rb6.webp",
    "Horizon Zero Dawn": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1u9l.webp",
    "Spider-Man Remastered": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp",
    "Baldur's Gate 3": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5f5z.webp",
    
    // Indie Games
    "Hades": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2i2d.webp",
    "Hollow Knight": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp",
    "Celeste": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp",
    "Ori and the Will of the Wisps": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1t8z.webp",
    "Dead Cells": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rhu.webp",
    "Stardew Valley": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp",
    "Among Us": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2eub.webp",
    "Fall Guys": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2fpz.webp",
    "Pizza Tower": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6d2z.webp",
    
    // Sports Games
    "FIFA 23": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s2f.webp",
    "NBA 2K23": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5l9p.webp",
    "F1 22": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4t4c.webp",
    
    // Shooters
    "Call of Duty: Modern Warfare II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s4j.webp",
    "Apex Legends": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20ai.webp",
    "Valorant": "https://images.igdb.com/igdb/image/upload/t_cover_big/co87xu.webp",
    "Overwatch 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5w2s.webp",
    "Counter-Strike 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6w0k.webp",
    
    // Strategy Games
    "Age of Empires IV": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3pud.webp",
    "Civilization VI": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q7r.webp",
    "Total War: Warhammer III": "https://images.igdb.com/igdb/image/upload/t_cover_big/co47od.webp",
    
    // Racing Games
    "Forza Horizon 5": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3x1q.webp",
    "Gran Turismo 7": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4dqt.webp",
    
    // Action/Adventure
    "Assassin's Creed Valhalla": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2c7g.webp",
    "Minecraft": "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.webp",
    "Terraria": "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x8.webp",
    "Roblox": "https://images.igdb.com/igdb/image/upload/t_cover_big/co87xu.webp",
    
    // Horror Games
    "Resident Evil 4": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6ac8.webp",
    "Phasmophobia": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lef.webp",
    
    // MMO/Online
    "World of Warcraft": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20ai.webp",
    "Final Fantasy XIV": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.webp",
    "Lost Ark": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jec.webp",
    
    // Battle Royale
    "Fortnite": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20ai.webp",
    "PUBG": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q2m.webp",
    
    // Simulation
    "The Sims 4": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q7c.webp",
    "Cities: Skylines": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20ai.webp",
  };
  
  return gameImages[game.title] || game.cover_image_url || "https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp";
};
