window.onready  = (function(t){
    'use strict';
  
    function Cards (container) {
      this.container = container;
      this.cards = container.children;
    }
  
    Cards.prototype.init = function(height) {
      var i, len,
          card, left;
      
      if (height < 600) {
        this.container.style.paddingTop = '5%';
        this.container.style.perspectiveOrigin = '50% 150%';
      } else if (height > 600 && height < 800) {
        this.container.style.paddingTop = '8%';
        this.container.style.perspectiveOrigin = '50% 101%';
      } else {
        this.container.style.paddingTop = '14%';
        this.container.style.perspectiveOrigin = '50% 81%';
      }
  
      for (i = 0, len = this.cards.length; i < len; i += 1) {
        card = this.cards[i];
        i % 2 === 0 ? card.style.left = '20%' : card.style.right = '20%';
        card.position = -i * 525;
        card.oldPos = -i * 525;
        card.style.transform = 'translate3d(0, 0, ' + card.position + 'px)';
      }
  
    };
  
    Cards.prototype.update = function(vel, camera) {
      var i, len, 
          card, clone;
  
      // if (vel === 0) vel = -250;
      for (i = 0, len = this.cards.length; i < len; i += 1) {
  
        card = this.cards[i];
        card.position += Math.round(-vel / 5);
  
        if (card.position > 0 && card.position < 800) {
          card.style.transform = 'translate3d(0, 0, ' + card.position + 'px) '  + 
            'rotateX(' + card.position / 15 + 'deg)';
        } else {
          card.style.transform = 'translate3d(0, 0, ' + card.position + 'px) ';
        }
        // append to beginning if element is behind camera
        if (card.position >= 800) {
          clone = card.cloneNode(true);
          clone.position = -2500;
          this.container.insertBefore(clone, this.cards[0])
          this.container.removeChild(card);
          // append it do end if its too far away
        } else if (card.position < -2500) {
          clone = card.cloneNode(true);
          clone.position = 800;
          this.container.appendChild(clone);
          this.container.removeChild(card);
        }
  
      }
    }
  
    function Background (colors, size) {
      this.colors = colors;
      this.size = size;
      this.mesh = null;
    }
  
    Background.prototype.init = function(scene) {
      var geometry, materials, mesh,  
          i, j, 
          faceLen, vertLen,
          range;
  
      geometry = new t.PlaneGeometry(this.size.width, this.size.height, this.size.vertSize.width, this.size.vertSize.height);
  
      // assign colors to each triangle
      materials = [];
      for (i = 0; i < this.colors.length; i += 1) {
        materials.push(
          new t.MeshBasicMaterial({
            color: this.colors[i]
          })
        );
      }
  
      // paint each triangle (half face)
      faceLen = geometry.faces.length / 2;
      for (i = 0; i < faceLen; i += 1) {
        j = 2 * i;
        geometry.faces[j].materialIndex = i % 3;
      }
  
      // shift geometry's vertices
      vertLen = geometry.vertices.length;
      for (i = 0; i < vertLen; i += 1) {
        range = Math.random() * 0.525;
        geometry.vertices[i].z = range;
      }
  
      // make a mesh
      mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) ); 
      mesh.position.set(0, 0, 0);
      this.mesh = mesh;
      scene.add(this.mesh);
  
    };
  
    var SETTINGS3D, 
        WIDTH, HEIGHT,
        camera, scene, renderer,
        background,
        scrollVel,
        cardsCollection;
  
    // assign constants
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    SETTINGS3D = {
      pov: 45,
      aspectRatio: WIDTH / HEIGHT,
      near: 0.1,
      far: 150
    };
  
    // start program
    init();
    function init() {
  
      // remove loader
      var loader = document.body.querySelector('#loading');
      loader.parentNode.removeChild(loader);
  
      // set up 3d camera, scene & renderer
      camera = new t.PerspectiveCamera(SETTINGS3D.pov, SETTINGS3D.aspectRatio, SETTINGS3D.near, SETTINGS3D.far);
      scene = new t.Scene();
      scene.fog = new THREE.Fog(0xffffff, 20, 100);
      scene.fog.color.setRGB(255, 255, 255);
  
      renderer = new t.WebGLRenderer();
      renderer.setSize(WIDTH, HEIGHT);
      renderer.setClearColor(0xFFFFFF);
  
      // append renderer to body
      document.body.appendChild(renderer.domElement);
  
      // adjust camera position and look at scene's center
      camera.position.set(0, -20, 1);
      camera.lookAt(scene.position);
      scene.add(camera);
  
      // assign a new BG
      background = new Background([
        0xfafafa, 0xFFFFFF, 0xededff 
      ], {
        width: 40,
        height: 40,
        vertSize: {
          width: 25,
          height: 25
        }
      });  
      // init the BG
      background.init(scene);
      
  
      cardsCollection = new Cards(document.querySelector('section#timeline'));
      cardsCollection.init(HEIGHT);
  
      scrollVel = 0;
      document.body.addEventListener('mousewheel', function(e) {
        e.preventDefault();
        scrollVel += e.deltaY;
      }, false); 
  
      document.body.onresize = function() {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
      }                               
  
      // start rendering
      render();
  
    }
  
    function render() {
      window.requestAnimationFrame(render);
      renderer.render(scene, camera);
      
      background.mesh.geometry.verticesNeedUpdate = true;
      background.mesh.geometry.vertices.forEach(updateVerts);
      
      cardsCollection.update(scrollVel, camera);
  
      scrollVel *= 0.95;
  
    }
  
    // update background's verts based on scroll pos
    function updateVerts(vert) {
  
      vert.y += scrollVel / 800;
  
      handleBoundaries(vert);
    }
  
    // handle boundaries
    function handleBoundaries(vert, i) {
  
      if (vert.y < -20) {
        vert.y = 20;
      } else if (vert.y > 20) {
        vert.y = -20;
      }
  
    }
  
  }(THREE));