import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Quiz, Asset } from './types';

interface VisualRecallDB extends DBSchema {
  quizzes: {
    key: string;
    value: Quiz;
  };
  assets: {
    key: string;
    value: Asset;
  };
}

let dbPromise: Promise<IDBPDatabase<VisualRecallDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<VisualRecallDB>('visual-recall-v1', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('quizzes')) {
          db.createObjectStore('quizzes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveQuiz = async (quiz: Quiz) => {
  const db = await initDB();
  return db.put('quizzes', quiz);
};

export const getQuizzes = async () => {
  const db = await initDB();
  return db.getAll('quizzes');
};

export const getQuiz = async (id: string) => {
  const db = await initDB();
  return db.get('quizzes', id);
};

export const deleteQuiz = async (id: string) => {
  const db = await initDB();
  return db.delete('quizzes', id);
};

export const saveAsset = async (asset: Asset) => {
  const db = await initDB();
  return db.put('assets', asset);
};

export const getAsset = async (id: string) => {
  const db = await initDB();
  return db.get('assets', id);
};

// Helper to convert File to Base64 Asset
export const fileToAsset = (file: File): Promise<Asset> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: crypto.randomUUID(),
        data: reader.result as string,
        type: file.type as any,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Seed Data
export const seedInitialData = async () => {
  const quizzes = await getQuizzes();
  if (quizzes.length > 0) return; // Already seeded

  const createSvgDataUri = (color: string, text: string, shape: 'rect' | 'circle' = 'rect') => {
    const content = shape === 'rect' 
        ? `<rect width="200" height="200" fill="${color}" rx="20"/>`
        : `<circle cx="100" cy="100" r="90" fill="${color}"/>`;
        
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">${content}<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="white" font-weight="bold">${text}</text></svg>`)}`;
  };

  // --- Assets ---
  const lionId = crypto.randomUUID();
  const elephantId = crypto.randomUUID();
  const leopardId = crypto.randomUUID();
  
  // Body Parts
  const headId = crypto.randomUUID();
  const handId = crypto.randomUUID();
  const footId = crypto.randomUUID();
  const torsoId = crypto.randomUUID();

  // Clothes
  const hatId = crypto.randomUUID();
  const gloveId = crypto.randomUUID();
  const shoeId = crypto.randomUUID();
  const shirtId = crypto.randomUUID();

  // Seasons
  const sunId = crypto.randomUUID();
  const snowId = crypto.randomUUID();
  const leafId = crypto.randomUUID();
  const flowerId = crypto.randomUUID();

  // Season Clothes
  const swimsuitId = crypto.randomUUID();
  const coatId = crypto.randomUUID();
  const sweaterId = crypto.randomUUID();
  const raincoatId = crypto.randomUUID();

  // Create Assets
  await saveAsset({ id: lionId, data: createSvgDataUri('#f59e0b', 'LION'), type: 'image/svg+xml' });
  await saveAsset({ id: elephantId, data: createSvgDataUri('#64748b', 'ELEPHANT'), type: 'image/svg+xml' });
  await saveAsset({ id: leopardId, data: createSvgDataUri('#d97706', 'LEOPARD'), type: 'image/svg+xml' });

  await saveAsset({ id: headId, data: createSvgDataUri('#fca5a5', 'HEAD', 'circle'), type: 'image/svg+xml' });
  await saveAsset({ id: handId, data: createSvgDataUri('#fca5a5', 'HAND', 'circle'), type: 'image/svg+xml' });
  await saveAsset({ id: footId, data: createSvgDataUri('#fca5a5', 'FOOT', 'circle'), type: 'image/svg+xml' });
  await saveAsset({ id: torsoId, data: createSvgDataUri('#fca5a5', 'BODY', 'circle'), type: 'image/svg+xml' });

  await saveAsset({ id: hatId, data: createSvgDataUri('#3b82f6', 'HAT'), type: 'image/svg+xml' });
  await saveAsset({ id: gloveId, data: createSvgDataUri('#ef4444', 'GLOVE'), type: 'image/svg+xml' });
  await saveAsset({ id: shoeId, data: createSvgDataUri('#10b981', 'SHOE'), type: 'image/svg+xml' });
  await saveAsset({ id: shirtId, data: createSvgDataUri('#8b5cf6', 'SHIRT'), type: 'image/svg+xml' });

  await saveAsset({ id: sunId, data: createSvgDataUri('#fbbf24', 'SUMMER', 'circle'), type: 'image/svg+xml' });
  await saveAsset({ id: snowId, data: createSvgDataUri('#38bdf8', 'WINTER', 'circle'), type: 'image/svg+xml' });
  await saveAsset({ id: leafId, data: createSvgDataUri('#ea580c', 'AUTUMN', 'circle'), type: 'image/svg+xml' });
  await saveAsset({ id: flowerId, data: createSvgDataUri('#ec4899', 'SPRING', 'circle'), type: 'image/svg+xml' });

  await saveAsset({ id: swimsuitId, data: createSvgDataUri('#06b6d4', 'SWIMSUIT'), type: 'image/svg+xml' });
  await saveAsset({ id: coatId, data: createSvgDataUri('#1e293b', 'COAT'), type: 'image/svg+xml' });
  await saveAsset({ id: sweaterId, data: createSvgDataUri('#d97706', 'SWEATER'), type: 'image/svg+xml' });
  await saveAsset({ id: raincoatId, data: createSvgDataUri('#facc15', 'RAINCOAT'), type: 'image/svg+xml' });

  // --- Quiz 1: Big 5 Animals (Tap Select) ---
  const animalsQuiz: Quiz = {
    id: crypto.randomUUID(),
    title: 'Big 5 Animals',
    createdAt: Date.now(),
    questions: [
      {
        id: crypto.randomUUID(),
        type: 'TAP_SELECT',
        promptText: 'Which one is the LION?',
        options: [
          { id: crypto.randomUUID(), assetId: lionId, isCorrect: true },
          { id: crypto.randomUUID(), assetId: elephantId, isCorrect: false },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'TAP_SELECT',
        promptText: 'Find the ELEPHANT!',
        options: [
          { id: crypto.randomUUID(), assetId: leopardId, isCorrect: false },
          { id: crypto.randomUUID(), assetId: elephantId, isCorrect: true },
          { id: crypto.randomUUID(), assetId: lionId, isCorrect: false },
        ],
      }
    ]
  };

  // --- Quiz 2: My Body (Drag Match) ---
  const headZoneId = crypto.randomUUID();
  const handZoneId = crypto.randomUUID();
  const footZoneId = crypto.randomUUID();
  const torsoZoneId = crypto.randomUUID();

  const bodyQuiz: Quiz = {
    id: crypto.randomUUID(),
    title: 'My Body',
    createdAt: Date.now(),
    questions: [
      {
        id: crypto.randomUUID(),
        type: 'DRAG_MATCH',
        promptText: 'Match the clothes to the body parts!',
        dropZones: [
            { id: headZoneId, x: 0, y: 0, width: 0, height: 0, label: 'Head', assetId: headId },
            { id: handZoneId, x: 0, y: 0, width: 0, height: 0, label: 'Hand', assetId: handId },
            { id: footZoneId, x: 0, y: 0, width: 0, height: 0, label: 'Foot', assetId: footId },
            { id: torsoZoneId, x: 0, y: 0, width: 0, height: 0, label: 'Body', assetId: torsoId },
        ],
        options: [
          { id: crypto.randomUUID(), assetId: hatId, isCorrect: true, matchZoneId: headZoneId },
          { id: crypto.randomUUID(), assetId: gloveId, isCorrect: true, matchZoneId: handZoneId },
          { id: crypto.randomUUID(), assetId: shoeId, isCorrect: true, matchZoneId: footZoneId },
          { id: crypto.randomUUID(), assetId: shirtId, isCorrect: true, matchZoneId: torsoZoneId },
        ],
      }
    ]
  };

  // --- Quiz 3: Seasons (Drag Match) ---
  const summerZoneId = crypto.randomUUID();
  const winterZoneId = crypto.randomUUID();
  const autumnZoneId = crypto.randomUUID();
  const springZoneId = crypto.randomUUID();

  const seasonsQuiz: Quiz = {
    id: crypto.randomUUID(),
    title: 'Seasons',
    createdAt: Date.now(),
    questions: [
      {
        id: crypto.randomUUID(),
        type: 'DRAG_MATCH',
        promptText: 'Match the clothes to the season!',
        dropZones: [
            { id: summerZoneId, x: 0, y: 0, width: 0, height: 0, label: 'Summer', assetId: sunId },
            { id: winterZoneId, x: 0, y: 0, width: 0, height: 0, label: 'Winter', assetId: snowId },
            { id: autumnZoneId, x: 0, y: 0, width: 0, height: 0, label: 'Autumn', assetId: leafId },
            { id: springZoneId, x: 0, y: 0, width: 0, height: 0, label: 'Spring', assetId: flowerId },
        ],
        options: [
          { id: crypto.randomUUID(), assetId: swimsuitId, isCorrect: true, matchZoneId: summerZoneId },
          { id: crypto.randomUUID(), assetId: coatId, isCorrect: true, matchZoneId: winterZoneId },
          { id: crypto.randomUUID(), assetId: sweaterId, isCorrect: true, matchZoneId: autumnZoneId },
          { id: crypto.randomUUID(), assetId: raincoatId, isCorrect: true, matchZoneId: springZoneId },
        ],
      }
    ]
  };

  await saveQuiz(animalsQuiz);
  await saveQuiz(bodyQuiz);
  await saveQuiz(seasonsQuiz);
};
