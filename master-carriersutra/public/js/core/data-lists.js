/**
 * core/data-lists.js
 * Study data: subjects, backup quiz questions and career ideas.
 */
"use strict";

// The five school subjects the app tracks.
const SUBJ = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'];

// Backup quiz questions, used when the AI cannot write new ones.
const BANK = { Mathematics: [['What is 15% of 200?', ['20', '30', '25', '35'], 1], ['Solve 2x + 6 = 14.', ['x = 3', 'x = 4', 'x = 5', 'x = 10'], 1], ['Square root of 144?', ['10', '11', '12', '14'], 2]], Science: [['Which gas do plants absorb for photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], 2], ['SI unit of force?', ['Joule', 'Newton', 'Watt', 'Pascal'], 1], ['Powerhouse of the cell?', ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'], 2]], English: [['Which word is a noun in "The cat sleeps"?', ['The', 'cat', 'sleeps', 'None'], 1], ['Past tense of "go"?', ['goed', 'gone', 'went', 'going'], 2], ['Which is a conjunction?', ['But', 'Quickly', 'Blue', 'Run'], 0]], 'Social Science': [['First Prime Minister of India?', ['Nehru', 'Gandhi', 'Patel', 'Bose'], 0], ['Longest river in India?', ['Yamuna', 'Godavari', 'Ganga', 'Indus'], 2], ['India became a republic in?', ['1947', '1950', '1952', '1935'], 1]], Hindi: [['"सूर्य" का पर्यायवाची?', ['चंद्र', 'रवि', 'जल', 'वायु'], 1], ['संज्ञा का उदाहरण?', ['दौड़ना', 'सुंदर', 'किताब', 'धीरे'], 2], ['"दिन" का विलोम?', ['रात', 'सुबह', 'शाम', 'दोपहर'], 0]] };

// Possible career directions for each subject (used by the portfolio).
const CAREERS = { Mathematics: ['Engineering (Science with maths)', 'Data and computing', 'Finance, CA, statistics'], Science: ['Medicine (Science with biology)', 'Research and biotech', 'Environmental science'], English: ['Law and journalism', 'Writing and communication', 'Civil services'], 'Social Science': ['Civil services', 'Economics and public policy', 'History and teaching'], Hindi: ['Literature and media', 'Teaching', 'Public administration'] };
