const config = {
  density: 0.004, // nombre de particules par pixel
  xSpeed: 2, // speed at which the particles move along the x axis
  flowStrength: 1, // influence du champ de flux (force du mouvement)
  jitter: 0, // micro-agitation (Petits mouvements aléatoires indépendants)
  trailLength: 24, // number of frames the trail will exist for
  maxColorSat: 255,
  maxPhase: 1, // the maximum phase offset for vector calculation along y axis
  friction: 0.8, // amortissement (ralentissement progressif)
  radiusMin: 1, // Taille minimale possible d'une particule
  radiusMax: 3, // Taille maximale possible d'une particule
};
