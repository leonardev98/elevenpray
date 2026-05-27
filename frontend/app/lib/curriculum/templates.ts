export const SYSTEMS_TEMPLATE = [
  { cycleNumber: 1, code: "11015", name: "Precálculo", credits: 3 },
  { cycleNumber: 1, code: "21012", name: "Lógica Matemática", credits: 3 },
  { cycleNumber: 1, code: "41025", name: "Fundamentos de Programación", credits: 4, prerequisiteCodes: ["21012"] },
  { cycleNumber: 2, code: "13015", name: "Cálculo I", credits: 4, prerequisiteCodes: ["11015"] },
  { cycleNumber: 2, code: "23012", name: "Matemáticas Discretas", credits: 3, prerequisiteCodes: ["21012"] },
  { cycleNumber: 2, code: "63202", name: "Álgebra Lineal I", credits: 3, prerequisiteCodes: ["11015"] },
  { cycleNumber: 3, code: "14015", name: "Cálculo II", credits: 4, prerequisiteCodes: ["13015"] },
  { cycleNumber: 3, code: "54034", name: "Bases de Datos I", credits: 4, prerequisiteCodes: ["41025"] },
] as const;

export const LAW_TEMPLATE = [
  { cycleNumber: 1, code: "DER101", name: "Introducción al Derecho", credits: 4 },
  { cycleNumber: 1, code: "DER102", name: "Historia del Derecho", credits: 3 },
  { cycleNumber: 2, code: "DER201", name: "Derecho Civil I", credits: 5, prerequisiteCodes: ["DER101"] },
  { cycleNumber: 2, code: "DER202", name: "Derecho Constitucional", credits: 4, prerequisiteCodes: ["DER101"] },
  { cycleNumber: 3, code: "DER301", name: "Derecho Penal", credits: 4, prerequisiteCodes: ["DER201"] },
] as const;
