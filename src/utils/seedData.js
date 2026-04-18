const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exercise = require('../models/Exercise');
const User = require('../models/User');

dotenv.config();

// Esercizi di default
const defaultExercises = [
  // PETTO
  {
    name: 'Panca Piana',
    description: 'Esercizio fondamentale per lo sviluppo del petto',
    category: 'petto',
    muscleGroup: ['petto', 'tricipiti', 'deltoidi'],
    equipment: 'bilanciere',
    difficulty: 'intermedio',
    instructions: 'Sdraiati sulla panca, afferra il bilanciere con presa leggermente più larga delle spalle. Abbassa il bilanciere al petto e spingi verso l\'alto.',
    isDefault: true
  },
  {
    name: 'Panca Inclinata',
    description: 'Variante della panca per enfatizzare la parte superiore del petto',
    category: 'petto',
    muscleGroup: ['petto', 'deltoidi'],
    equipment: 'bilanciere',
    difficulty: 'intermedio',
    instructions: 'Esegui come la panca piana ma su panca inclinata a 30-45 gradi.',
    isDefault: true
  },
  {
    name: 'Croci con Manubri',
    description: 'Esercizio di isolamento per il petto',
    category: 'petto',
    muscleGroup: ['petto'],
    equipment: 'manubri',
    difficulty: 'intermedio',
    instructions: 'Sdraiati su panca piana, manubri in mano. Apri le braccia lateralmente mantenendo un leggero piegamento dei gomiti.',
    isDefault: true
  },
  {
    name: 'Push-up',
    description: 'Flessioni a corpo libero',
    category: 'petto',
    muscleGroup: ['petto', 'tricipiti', 'deltoidi'],
    equipment: 'propria_peso',
    difficulty: 'principiante',
    instructions: 'Posizione plank, mani alla larghezza delle spalle. Abbassa il corpo fino a toccare il petto a terra e risali.',
    isDefault: true
  },
  
  // SCHIENA
  {
    name: 'Stacco da Terra',
    description: 'Esercizio completo per schiena e gambe',
    category: 'schiena',
    muscleGroup: ['dorsali', 'glutei', 'femorali', 'trapezi'],
    equipment: 'bilanciere',
    difficulty: 'avanzato',
    instructions: 'Piedi alla larghezza delle spalle, afferra il bilanciere. Mantieni la schiena dritta e stendi le gambe e la schiena contemporaneamente.',
    isDefault: true
  },
  {
    name: 'Lat Machine',
    description: 'Esercizio per la larghezza della schiena',
    category: 'schiena',
    muscleGroup: ['dorsali', 'bicipiti'],
    equipment: 'macchinario',
    difficulty: 'principiante',
    instructions: 'Siediti alla macchina, afferra la barra e tira verso il basso fino a livello del petto.',
    isDefault: true
  },
  {
    name: 'Rematore con Manubrio',
    description: 'Esercizio unilaterale per la schiena',
    category: 'schiena',
    muscleGroup: ['dorsali', 'bicipiti'],
    equipment: 'manubri',
    difficulty: 'intermedio',
    instructions: 'Appoggia un ginocchio e una mano su panca piana. Tira il manubrio verso il fianco contrarreendo il dorsale.',
    isDefault: true
  },
  {
    name: 'Pull-up',
    description: 'Trazioni alla sbarra',
    category: 'schiena',
    muscleGroup: ['dorsali', 'bicipiti'],
    equipment: 'propria_peso',
    difficulty: 'intermedio',
    instructions: 'Afferra la sbarra con presa larga, tira il corpo verso l\'alto fino a portare il mento sopra la sbarra.',
    isDefault: true
  },
  
  // SPALLE
  {
    name: 'Military Press',
    description: 'Spinte in piedi con bilanciere',
    category: 'spalle',
    muscleGroup: ['deltoidi', 'tricipiti'],
    equipment: 'bilanciere',
    difficulty: 'intermedio',
    instructions: 'In piedi, bilanciere alla clavicola. Spingi verso l\'alto fino a estensione completa delle braccia.',
    isDefault: true
  },
  {
    name: 'Alzate Laterali',
    description: 'Isolamento per i deltoidi laterali',
    category: 'spalle',
    muscleGroup: ['deltoidi'],
    equipment: 'manubri',
    difficulty: 'principiante',
    instructions: 'In piedi, manubri ai lati. Solleva le braccia lateralmente fino a livello delle spalle.',
    isDefault: true
  },
  {
    name: 'Alzate Frontali',
    description: 'Esercizio per i deltoidi anteriori',
    category: 'spalle',
    muscleGroup: ['deltoidi'],
    equipment: 'manubri',
    difficulty: 'principiante',
    instructions: 'Solleva i manubri frontalmente fino a livello delle spalle, alternando le braccia.',
    isDefault: true
  },
  
  // BRACCIA
  {
    name: 'Curl con Bilanciere',
    description: 'Esercizio base per i bicipiti',
    category: 'braccia',
    muscleGroup: ['bicipiti'],
    equipment: 'bilanciere',
    difficulty: 'principiante',
    instructions: 'In piedi, bilanciere davanti alle cosce. Piega i gomiti sollevando il bilanciere verso le spalle.',
    isDefault: true
  },
  {
    name: 'Curl con Manubri',
    description: 'Variante unilaterale del curl',
    category: 'braccia',
    muscleGroup: ['bicipiti'],
    equipment: 'manubri',
    difficulty: 'principiante',
    instructions: 'Esegui il curl alternando le braccia o simultaneamente.',
    isDefault: true
  },
  {
    name: 'French Press',
    description: 'Esercizio per i tricipiti',
    category: 'braccia',
    muscleGroup: ['tricipiti'],
    equipment: 'bilanciere',
    difficulty: 'intermedio',
    instructions: 'Sdraiato su panca, bilanciere sopra il petto. Piega solo i gomiti abbassando il bilanciere verso la fronte.',
    isDefault: true
  },
  {
    name: 'Pushdown Cavi',
    description: 'Esercizio di isolamento per tricipiti',
    category: 'braccia',
    muscleGroup: ['tricipiti'],
    equipment: 'cavi',
    difficulty: 'principiante',
    instructions: 'In piedi davanti al cavo alto, spingi verso il basso estendendo i gomiti.',
    isDefault: true
  },
  
  // GAMBE
  {
    name: 'Squat',
    description: 'Il re degli esercizi per le gambe',
    category: 'gambe',
    muscleGroup: ['quadricipiti', 'glutei', 'femorali'],
    equipment: 'bilanciere',
    difficulty: 'intermedio',
    instructions: 'Bilanciere sulle spalle, scendi piegando ginocchia e fianchi fino a quando le cosce sono parallele al pavimento.',
    isDefault: true
  },
  {
    name: 'Leg Press',
    description: 'Esercizio su macchinario per le gambe',
    category: 'gambe',
    muscleGroup: ['quadricipiti', 'glutei'],
    equipment: 'macchinario',
    difficulty: 'principiante',
    instructions: 'Siediti alla macchina, piedi sulla pedana. Stendi le gambe spingendo la pedana lontano da te.',
    isDefault: true
  },
  {
    name: 'Affondi',
    description: 'Esercizio unilaterale per gambe e glutei',
    category: 'gambe',
    muscleGroup: ['quadricipiti', 'glutei', 'femorali'],
    equipment: 'manubri',
    difficulty: 'intermedio',
    instructions: 'Fai un passo avanti piegando entrambe le ginocchia a 90 gradi, poi ritorna in posizione.',
    isDefault: true
  },
  {
    name: 'Leg Curl',
    description: 'Isolamento per i femorali',
    category: 'gambe',
    muscleGroup: ['femorali'],
    equipment: 'macchinario',
    difficulty: 'principiante',
    instructions: 'Siediti o sdraiati alla macchina, piega le ginocchia portando i talloni verso i glutei.',
    isDefault: true
  },
  {
    name: 'Leg Extension',
    description: 'Isolamento per i quadricipiti',
    category: 'gambe',
    muscleGroup: ['quadricipiti'],
    equipment: 'macchinario',
    difficulty: 'principiante',
    instructions: 'Siediti alla macchina, estendi le gambe sollevando il carico.',
    isDefault: true
  },
  {
    name: 'Calf Raise',
    description: 'Esercizio per i polpacci',
    category: 'gambe',
    muscleGroup: ['polpacci'],
    equipment: 'macchinario',
    difficulty: 'principiante',
    instructions: 'Sali sulle punte contraendo i polpacci, poi scendi lentamente.',
    isDefault: true
  },
  
  // CORE
  {
    name: 'Crunch',
    description: 'Esercizio base per gli addominali',
    category: 'core',
    muscleGroup: ['addominali'],
    equipment: 'nessuno',
    difficulty: 'principiante',
    instructions: 'Sdraiato sulla schiena, ginocchia piegate. Solleva le spalle contraendo gli addominali.',
    isDefault: true
  },
  {
    name: 'Plank',
    description: 'Esercizio isometrico per il core',
    category: 'core',
    muscleGroup: ['addominali', 'lombari'],
    equipment: 'nessuno',
    difficulty: 'principiante',
    instructions: 'Posizione di supporto su avambraccia e punta dei piedi, mantieni il corpo in linea retta.',
    isDefault: true
  },
  {
    name: 'Leg Raise',
    description: 'Sollevamento gambe per addominali inferiori',
    category: 'core',
    muscleGroup: ['addominali'],
    equipment: 'nessuno',
    difficulty: 'intermedio',
    instructions: 'Sdraiato, solleva le gambe dritte fino a 90 gradi, poi abbassa lentamente.',
    isDefault: true
  },
  {
    name: 'Russian Twist',
    description: 'Esercizio per obliqui',
    category: 'core',
    muscleGroup: ['addominali'],
    equipment: 'manubri',
    difficulty: 'intermedio',
    instructions: 'Seduto con ginocchia piegate e piedi sollevati, ruota il torso da un lato all\'altro.',
    isDefault: true
  },
  
  // CARDIO
  {
    name: 'Tapis Roulant',
    description: 'Corsa o camminata su tapis roulant',
    category: 'cardio',
    muscleGroup: ['cardio'],
    equipment: 'macchinario',
    difficulty: 'principiante',
    instructions: 'Regola velocità e inclinazione secondo il tuo livello. Mantieni una postura eretta.',
    isDefault: true
  },
  {
    name: 'Cyclette',
    description: 'Bicicletta stazionaria',
    category: 'cardio',
    muscleGroup: ['cardio'],
    equipment: 'macchinario',
    difficulty: 'principiante',
    instructions: 'Pedala mantenendo una resistenza appropriata al tuo livello.',
    isDefault: true
  },
  {
    name: 'Ellittica',
    description: 'Macchina ellittica per cardio a basso impatto',
    category: 'cardio',
    muscleGroup: ['cardio'],
    equipment: 'macchinario',
    difficulty: 'principiante',
    instructions: 'Movimento fluido simile alla corsa ma senza impatto sulle articolazioni.',
    isDefault: true
  },
  {
    name: 'Rower',
    description: 'Vogatore per cardio e schiena',
    category: 'cardio',
    muscleGroup: ['cardio', 'dorsali'],
    equipment: 'macchinario',
    difficulty: 'intermedio',
    instructions: 'Movimento coordinato di gambe, schiena e braccia. Spingi con le gambe, tira con le braccia.',
    isDefault: true
  }
];

// Funzione per seed degli esercizi
const seedExercises = async () => {
  try {
    console.log('🌱 Inizio seeding esercizi...');
    
    // Conta esercizi esistenti
    const count = await Exercise.countDocuments({ isDefault: true });
    
    if (count > 0) {
      console.log(`✅ Trovati ${count} esercizi di default nel database`);
      console.log('🔄 Aggiornamento esercizi...');
      
      // Aggiorna o crea esercizi
      for (const exercise of defaultExercises) {
        await Exercise.findOneAndUpdate(
          { name: exercise.name, isDefault: true },
          exercise,
          { upsert: true, new: true }
        );
      }
      
      console.log('✅ Esercizi aggiornati con successo!');
    } else {
      console.log('📝 Creazione esercizi di default...');
      await Exercise.insertMany(defaultExercises);
      console.log(`✅ Creati ${defaultExercises.length} esercizi di default!`);
    }
  } catch (error) {
    console.error('❌ Errore seeding esercizi:', error);
  }
};

// Funzione per creare admin di default
const seedAdmin = async () => {
  try {
    console.log('🌱 Verifica utente admin...');
    
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('✅ Admin già esistente');
      return;
    }
    
    console.log('📝 Creazione utente admin di default...');
    
    await User.create({
      firstName: 'Admin',
      lastName: 'Gym',
      email: 'admin@gymmanagement.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    
    console.log('✅ Admin creato con successo!');
    console.log('   Email: admin@gymmanagement.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  Cambia la password dopo il primo login!');
  } catch (error) {
    console.error('❌ Errore creazione admin:', error);
  }
};

// Funzione principale
const seedDatabase = async () => {
  try {
    // Connetti al database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management');
    console.log('📡 Connesso al database MongoDB');
    
    // Esegui seeding
    await seedExercises();
    await seedAdmin();
    
    console.log('\n✅ Seeding completato con successo!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante il seeding:', error);
    process.exit(1);
  }
};

// Esegui se chiamato direttamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedExercises, seedAdmin };
