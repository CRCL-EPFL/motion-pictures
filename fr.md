---
layout: default
lang: fr
---

![img01](/assets/img/fig1.png)

### OBJECTIF DE LA RECHERCHE
Motion Pictures est une installation de recherche à petite échelle qui étudie la manière dont les projections numériques peuvent affecter notre utilisation de l'espace. D'abord conçu comme une réponse aux protocoles de distanciation sociale, le projet s'est orienté vers le développement d'une intelligence ambiante plus large qui réagit à la présence humaine. Toutes les quelques millisecondes, l'installation détecte les personnes se trouvant dans la zone délimitée et prédit leur mouvement en fonction de leur comportement antérieur. Ces prévisions sont traduites en images à la volée et projetées sur le sol sous les occupants. De cette manière, les données passent directement de la détection et du calcul à l'affichage dans l'espace réel. Contrairement aux méthodes d'analyse de l'occupation des bâtiments, cette approche implique les occupants dès le départ. En tant que telle, l'installation sert d'interface à des calculs spatiaux avancés tout en conservant une certaine autonomie.

Notre objectif est de décortiquer cette boucle de rétroaction et de voir comment les suggestions informatisées peuvent influencer le comportement, en particulier comment les biais dans le modèle prédictif et même les moyens de visualisation peuvent faire de cette installation un utilitaire pour optimiser l'utilisation de l'espace ou un acteur social qui encourage les gens à se connecter par sérendipité.

### DÉTECTION ET POLITIQUE DES DONNÉES

La collecte des données commence par la lecture des flux vidéo de chacun des modules de caméra connectés au NUC. YOLOv8 est utilisé pour la détection afin d'atteindre un équilibre entre performance et efficacité, avec un tracker basé sur l'apprentissage profond pour suivre les individus entre les images. Les résultats de la détection subissent plusieurs transformations avant d'être transmis à la visualisation pour s'assurer que les coordonnées correspondent à l'espace réel. Enfin, les emplacements sont soumis à un modèle de comportement des piétons basé sur Social Force, qui génère des suggestions de parcours à court terme pour les occupants.

Le projet ne recueille ni ne stocke jamais d'informations personnelles identifiables. Les données vidéo du système de caméras sont utilisées pour la détection et le suivi des personnes avant d'être traduites en coordonnées cartésiennes. Seules ces coordonnées sont utilisées pour le modèle de comportement et la projection de lumière.

![img02](/assets/img/fig2.png)

### VISUALIZATION
La visualisation est générée sous la forme d'un «shader» qui représente l'espace personnel de chaque occupant sous la forme d'une couleur distincte. Les «spots» changent de forme et de direction en fonction des modifications apportées au traceur et au modèle, tout en se combinant de manière unique en fonction de l'interaction entre les occupants.

### SETUP

Le matériel consiste en deux projecteurs, un ordinateur de bureau et deux caméras embarquées. Plusieurs projecteurs peuvent être connectés pour ajuster la taille et la forme de l'espace couvert, ce qui rend le système adaptable à différents sites et conditions.

![img03](/assets/img/fig3.png)

--------------

#### CREDITS

par Eric Duong et Prof. Stefana Parascho, CRCL, EPFL

Avec le soutien de :

**CRCL:** Maxence Grangeot, Alexandra Pittiglio, Isabelle Cogotti

**Habitat Research Center:** Elena Longhin

**GIS:** Gilles Guignet, François Perrin, Armin Krkic, Luca Mari

| ![crcl](/assets/img/crcl.png) | ![epfl](/assets/img/epfl.png) | ![hrc](/assets/img/hrc.png) |