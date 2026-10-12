/**
 * characters/languages.js
 * The languages the buddy can speak.
 */
"use strict";

// Languages the buddy can speak: [voice code, name].
const LANGUAGES = [['en-IN', 'English'], ['hi-IN', 'Hindi'], ['en-IN', 'Hinglish (Hindi in English letters)'], ['mr-IN', 'Marathi'], ['bn-IN', 'Bengali'], ['ta-IN', 'Tamil'], ['te-IN', 'Telugu'], ['gu-IN', 'Gujarati'], ['kn-IN', 'Kannada'], ['ml-IN', 'Malayalam'], ['pa-IN', 'Punjabi'], ['or-IN', 'Odia']];

// The language the student chose.
const currentLanguage = () => LANGUAGES[(appState.p && appState.p.lang) || 0];
