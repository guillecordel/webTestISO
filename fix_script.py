#!/usr/bin/env python3
import re

file_path = r'C:\Users\guill\Desktop\webTestISO.worktrees\copilot-worktree-2026-03-26T15-17-50\script.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the old EXAM_FILES structure with new one
new_start = '''const SUBJECTS = [
  { id: "iso", nombre: "Sistemas Operativos" },
  { id: "sstt", nombre: "Servicios y Sistemas de Telecomunicaciones" },
];

const EXAM_FILES = {
  iso: [
    { id: "tema1", nombre: "Examen tema-1", archivo: "data/preguntas-tema-1.json" },
    { id: "tema2", nombre: "Examen tema-2", archivo: "data/preguntas-tema-2.json" },
    { id: "tema3", nombre: "Examen tema-3", archivo: "data/preguntas-tema-3.json" },
    { id: "tema4", nombre: "Examen tema-4", archivo: "data/preguntas-tema-4.json" },
    { id: "tema5", nombre: "Examen tema-5", archivo: "data/preguntas-tema-5.json" },
    { id: "tema6", nombre: "Examen tema-6", archivo: "data/preguntas-tema-6.json" },
    { id: "prueba", nombre: "Examen parcial-1 Prueba", archivo: "data/parcial-1-prueba.json" },
    { id: "noviembre2023", nombre: "Examen parcial-1 Noviembre 2023", archivo: "data/parcial-1-2023.json" },
    { id: "noviembre2022", nombre: "Examen parcial-1 Noviembre 2022", archivo: "data/parcial-1-2022.json" },
    { id: "prueba1", nombre: "Examen parcial-2 Prueba", archivo: "data/parcial-2-prueba.json" },
    { id: "diciembre2023", nombre: "Examen parcial-2 Diciembre 2023", archivo: "data/parcial-2-2023.json" },
    { id: "diciembre2022", nombre: "Examen parcial-2 Diciembre 2022", archivo: "data/parcial-2-2022.json" },
    { id: "mayo2023", nombre: "Examen Mayo 2023", archivo: "data/examenMayo2023.json" },
    { id: "junio2023", nombre: "Examen Junio 2023", archivo: "data/examenJunio2023.json" },
  ],
  sstt: [
    { id: "tema1", nombre: "Examen tema-1", archivo: "data/sstt-tema-1.json" },
    { id: "tema2", nombre: "Examen tema-2", archivo: "data/sstt-tema-2.json" },
  ],
};

const DEFAULT_SUBJECT = "iso";'''

# Find and replace
pattern = r'const EXAM_FILES = \[[\s\S]*?\];'
modified = re.sub(pattern, new_start, content, count=1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(modified)

print('File updated successfully!')
