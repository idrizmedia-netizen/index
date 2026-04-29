// Barcha 9 ta bo'lim uchun laboratoriyalar bazasi (3 tadan)
const physicsLabs = [
    // 1. MEXANIKA
    { id: 1, category: "mexanika", title: "Matematik mayatnik", icon: "fa-tachometer-alt", component: "initPendulum" },
    { id: 2, category: "mexanika", title: "Erkin tushish", icon: "fa-arrow-down", component: "initFreeFall" },
    { id: 3, category: "mexanika", title: "Nyuton 2-qonuni", icon: "fa-dumbbell", component: "initNewtonTwo" },

    // 2. OPTIKA
    { id: 11, category: "optika", title: "Yupqa linzalar", icon: "fa-eye", component: "initLenses" },
    { id: 12, category: "optika", title: "Yorug'likning sinishi", icon: "fa-lightbulb", component: "initRefraction" },
    { id: 13, category: "optika", title: "Prizmada spektr", icon: "fa-rainbow", component: "initSpectrum" },

    // 3. ELEKTR
    { id: 21, category: "elektr", title: "Om qonuni (Zanjir)", icon: "fa-bolt", component: "initOhmCircuit" },
    { id: 22, category: "elektr", title: "Qarshiliklarni ulash", icon: "fa-microchip", component: "initResistors" },
    { id: 23, category: "elektr", title: "Kondensator quvvati", icon: "fa-battery-half", component: "initCapacitor" },

    // 4. TERMODINAMIKA
    { id: 31, category: "termodinamika", title: "Gaz qonunlari", icon: "fa-thermometer-half", component: "initGasLaws" },
    { id: 32, category: "termodinamika", title: "Broun harakati", icon: "fa-atom", component: "initBrownian" },
    { id: 33, category: "termodinamika", title: "Issiqlik muvozanati", icon: "fa-fire-alt", component: "initHeatEquilibrium" },

    // 5. TOLQINLAR
    { id: 41, category: "tolqinlar", title: "Tovush to'lqinlari", icon: "fa-volume-up", component: "initSoundWaves" },
    { id: 42, category: "tolqinlar", title: "Doppler effekti", icon: "fa-broadcast-tower", component: "initDoppler" },
    { id: 43, category: "tolqinlar", title: "Prujinali tebranish", icon: "fa-wave-square", component: "initSpring" },

    // 6. YADRO FIZIKASI
    { id: 51, category: "yadro-fizikasi", title: "Radioaktiv yemirilish", icon: "fa-radiation", component: "initRadioactive" },
    { id: 52, category: "yadro-fizikasi", title: "Fotoeffekt", icon: "fa-sun", component: "initPhotoEffect" },
    { id: 53, category: "yadro-fizikasi", title: "Bor atom modeli", icon: "fa-circle-notch", component: "initBohrModel" },

    // 7. ASTRONOMIYA
    { id: 61, category: "astronomiya", title: "Sayyoralar harakati", icon: "fa-globe-asia", component: "initPlanets" },
    { id: 62, category: "astronomiya", title: "Oy fazalari", icon: "fa-moon", component: "initMoonPhases" },
    { id: 63, category: "astronomiya", title: "Quyosh tizimi", icon: "fa-sun", component: "initSolarSystem" },

    // 8. AMALIY FIZIKA
    { id: 71, category: "amaliy-fizika", title: "Avtomobil tormozi", icon: "fa-car-crash", component: "initBrakingDistance" },
    { id: 72, category: "amaliy-fizika", title: "Liftda vaznsizlik", icon: "fa-arrows-alt-v", component: "initWeightless" },
    { id: 73, category: "amaliy-fizika", title: "Gidravlik press", icon: "fa-compress-arrows-alt", component: "initHydraulic" },

    // 9. PARADOKSLAR
    { id: 81, category: "paradokslar", title: "Vaqt dilatatsiyasi", icon: "fa-hourglass-start", component: "initTimeDilation" },
    { id: 82, category: "paradokslar", title: "Shryodinger mushugi", icon: "fa-cat", component: "initSchrodinger" },
    { id: 83, category: "paradokslar", title: "Egri fazo", icon: "fa-infinity", component: "initCurvedSpace" }
];

console.log("Jami " + physicsLabs.length + " ta laboratoriya bazaga yuklandi.");
