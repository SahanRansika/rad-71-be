import multer from "multer";

// can disk or memory 
// we choose memory 
const storage = multer.memoryStorage()

export const upload = multer({storage}) // storage: storage