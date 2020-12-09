// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing


//Note: I referred to Tutorial 4, Lecture Notes, as well as consultation with lecturer&tutor to code this assignment.
//I used mostly FRP by implementing Observables. But for some of my implementations, I had no choice but to use a bit of 
//imperative programming. Comments are available throughout the codes with better explanation of my implementation
//of the game.


function asteroids() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
  // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.
  const svg = document.getElementById("canvas")!;
  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property
  let g = new Elem(svg,'g')
    .attr("transform","translate(300 300) rotate(180)")  
  
  // create a polygon shape for the space ship as a child of the transform group
  let rect = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:lime;stroke:purple;stroke-width:1")

  // creates a circle to represent the bullet
  let bullet = new Elem(svg, 'circle')
    .attr("r", 3)
    .attr("style", "fill: white; stroke:white;stroke-width:1")


  // Radians to Degrees
  const radToDeg = (rad:number) => rad * 180 / Math.PI + 90;

  // Degrees to Radians
  const degToRad = (deg:number) => deg * Math.PI / 180;

  //Gets current transform property of the given element
  const transformMatrix = (e:Elem) => 
    new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform)


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Code for rotating the ship starts here
  //Subscribe mousemove event for rotation of the ship
  Observable.fromEvent<MouseEvent>(svg, "mousemove")
    // Calculate current pointer position
    .map(({clientX, clientY}) => ({
      lookx: clientX - svg.getBoundingClientRect().left,
      looky: clientY - svg.getBoundingClientRect().top,
      x: transformMatrix(g).m41, // m41 is transformX 
      y: transformMatrix(g).m42  // m42 is transformY 
    }))
    //changes the transform accordingly
    .map(({lookx, looky, x, y}) => 
      g.attr("transform",
        "translate(" + x + " " + y + ")" + "rotate(" + radToDeg(Math.atan2(looky - y, lookx - x)) + ")"))
    .subscribe((g) => console.log(g.attr("transform")));

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Code for shooting bullets starts here 
  // Function that moves the bullet in the direction where the cursor was clicked
  let animatedBullet = () => {
    let angle = Number(bullet.attr('angle'));

    //At the given intervals, the bullet moves in the specified angle
    Observable.interval(1)
      .takeUntil(Observable.interval(1200))
      .subscribe( () => bullet
        .attr('cx', Number(bullet.attr('cx')) + ((Math.sin(degToRad(angle)))*2.5))
        .attr('cy', Number(bullet.attr('cy')) - ((Math.cos(degToRad(angle)))*2.5)));
  }

  //Subscribe mousedown event for shooting of bullets
  let bulletObservable = Observable.fromEvent<MouseEvent>(svg, "mousedown")
  // Calculate current pointer position
    .map(({clientX, clientY}) => ({
      lookx: clientX - svg.getBoundingClientRect().left,
      looky: clientY - svg.getBoundingClientRect().top,
      x: transformMatrix(g).m41, 
      y: transformMatrix(g).m42,
    }))
    .map(({lookx, looky, x, y}) => {
      let angle = radToDeg(Math.atan2(Number(looky) - Number(y),
        Number(lookx) - Number(x)));
      bullet.attr("cx", x).attr("cy", y).attr("lookx", lookx).attr("looky", looky).attr("angle", angle);
    })
    .subscribe(animatedBullet);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////







  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Code for moving the ship starts here 
  //Each observable will subscribe to a function which wraps the whole canvas

  //An observable that picks up keyboard events
  let keyObservable = Observable.fromEvent<KeyboardEvent>(document, "keydown");

  // Observable for moving up (key: W)
  keyObservable
    .map((k) => {
      return k.keyCode == 87 ? g.attr("transform",
      "translate(" + transformMatrix(g).m41 + " " + (Number(transformMatrix(g).m42) - 20) + ")" +
      "rotate(" + 0 + ")") : undefined
    })
    //If the ship moves pass the upper bound, it will reappear at the lower bound
    .subscribe(() => {
      return (transformMatrix(g).m42 == 0)  ?  g.attr("transform",
      "translate(" + transformMatrix(g).m41 + " " + (600 - 20) + ")" +
      "rotate(" + 0 + ")") : undefined
    });

  
  // Observable for moving down (key: S)
  keyObservable
    .map((k) => {
      return k.keyCode == 83 ? g.attr("transform",
      "translate(" + transformMatrix(g).m41 + " " + (Number(transformMatrix(g).m42) + 20) + ")" +
      "rotate(" + 180 + ")") : undefined
    })
    //If the ship moves pass the lower bound, it will reappear at the upper bound
    .subscribe(() => {
      return (transformMatrix(g).m42 == 600)  ?  g.attr("transform",
      "translate(" + transformMatrix(g).m41 + " " + (0 + 20) + ")" +
      "rotate(" + 180 + ")")  : undefined; 
    })


  // Observable for moving right (key: D)
  keyObservable
    .map((k) => {
      return k.keyCode == 68 ? g.attr("transform",
      "translate(" + (Number(transformMatrix(g).m41) + 20) + " " + transformMatrix(g).m42 + ")" +
      "rotate(" + 90 + ")") : undefined
    })
    //If the ship moves pass the right bound, it will reappear at the left bound
    .subscribe(() => {
      return (transformMatrix(g).m41 == 600)  ?  g.attr("transform",
      "translate(" + (0 + 20) + " " + transformMatrix(g).m42 + ")" +
      "rotate(" + 90 + ")")   : undefined;
    })


  // Observable for moving left (key: A)
  keyObservable
    .map((k) => {
      return k.keyCode == 65 ? g.attr("transform",
      "translate(" + (Number(transformMatrix(g).m41) - 20) + " " + transformMatrix(g).m42 + ")" +
      "rotate(" + 270 + ")") : undefined
    })
    //If the ship moves pass the left bound, it will reappear at the right bound
    .subscribe(() => {
      return (transformMatrix(g).m41 == 0)  ?  g.attr("transform",
      "translate(" + (600 - 20) + " " + transformMatrix(g).m42 + ")" +
      "rotate(" + 270 + ")") : undefined; 
    })

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //function to remove any elements that go out of bounds
  let outOfBounds = (asteroid:Elem) => {
    return (transformMatrix(asteroid).m41 >= 650) || (transformMatrix(asteroid).m41 <= -50) ||  
    (transformMatrix(asteroid).m42 >= 650) || (transformMatrix(asteroid).m41 <= -50) ?
      asteroid.elem.remove() : undefined;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Variables to track the score
  let gameScore:number = 0;
  let initialScore:number = 0;

  const scoreBoard = document.getElementById("score")!;
  const level = document.getElementById("level")!;

  //Observable that increases the level of the game after every 1500 points
  let increaseLevel = Observable.interval(10)
    .map(() => {
      //Adds the level on the display
      gameScore - initialScore >= 2000 ? level.innerHTML = String(Number(level.innerHTML) + 1) : undefined;
      //updates the values of our score variables
      gameScore - initialScore >= 2000 ? initialScore = initialScore + 2000 : undefined;
      
    })
  increaseLevel.subscribe(() => {
    console.log(gameScore)
  });

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Function that creates smaller asteroids if the big asteroid has been shot
  let createSmallA = (x: number, y:number, asteroid:Elem, theta:number, speed:number) => {
    asteroid.elem.remove();


    //Below I hard coded 3 smaller asteroids. I had to hard code it as i wanted them to spawn with specific
    //distances from the bigger asteroid which was shot
    // creates a smaller asteroid 
    let b = new Elem(svg, 'a')
      .attr("transform","translate(" + (x-10) + " " + (y-10) + ") rotate(180)");  
    let smallAsteroidA = new Elem(svg, 'polygon', b.elem) 
      .attr("points","0,0 10,20 40,20 30,0")
      .attr("style","fill:black; stroke:white; stroke-width:1");

    // creates a smaller asteroid 
    let c = new Elem(svg, 'a')
      .attr("transform","translate(" + (x+10) + " " + (y) + ") rotate(180)");  
    let smallAsteroidB = new Elem(svg, 'polygon', c.elem) 
      .attr("points","0,0 10,20 40,20 30,0")
      .attr("style","fill:black; stroke:white; stroke-width:1");

    // creates a smaller asteroid 
    let d = new Elem(svg, 'a')
      .attr("transform","translate(" + (x-10) + " " + (y+10) + ") rotate(180)");  
    let smallAsteroidC = new Elem(svg, 'polygon', d.elem) 
      .attr("points","0,0 10,20 40,20 30,0")
      .attr("style","fill:black; stroke:white; stroke-width:1");


    //Animates and moves the small asteroids at a certain angle
    //At the given intervals, the small asteroids will move at a specific angle from their initial position
    Observable.interval(5)
      .takeUntil(Observable.interval(10000))
      //Once again I hard code the transform for the smaller asteroids as I want them to move in specific angles
      //which are different from one another
      .subscribe( () => { 
        b.attr("transform",
        "translate(" + (Number(transformMatrix(b).m41) + ((Math.sin(degToRad(theta)))*speed)) + 
        " " + (Number(transformMatrix(b).m42) -  ((Math.cos(degToRad(theta)))*speed)) + ")" +
        "rotate(" + 0 + ")");

        c.attr("transform",
        "translate(" + (Number(transformMatrix(c).m41) + ((Math.sin(degToRad(theta + 10)))*speed)) + 
        " " + (Number(transformMatrix(c).m42) -  ((Math.cos(degToRad(theta + 10)))*speed)) + ")" +
        "rotate(" + 90 + ")");

        d.attr("transform",
        "translate(" + (Number(transformMatrix(d).m41) + ((Math.sin(degToRad(theta - 10)))*0.5)) + 
        " " + (Number(transformMatrix(d).m42) -  ((Math.cos(degToRad(theta - 10)))*speed)) + ")" +
        "rotate(" + 180 + ")")
  
        //Removes the asteroids if they go out of bounds
        outOfBounds(b);
        outOfBounds(c);
        outOfBounds(d);

        //checks for collisions between small asteroids and bullets
        collision(b, bullet, asteroid, theta, 50, speed);
        collision(c, bullet, asteroid, theta, 50, speed);
        collision(d, bullet, asteroid, theta, 50, speed);

        //checks for collisions between small asteroids and ship
        collision(b, g, asteroid, theta, 0, speed);
        collision(c, g, asteroid, theta, 0, speed);
        collision(d, g, asteroid, theta, 0, speed);
        
      })
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////





  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Function that checks for collisions and performs the neccessary actions after collision
  let collision = (first:Elem, second:Elem, asteroid: Elem, theta:number, score:number, speed:number) => {
    let rect1 = first.elem.getBoundingClientRect();
    let rect2 = second.elem.getBoundingClientRect();
    let collide = false;

    //To check if the boundingRect of the elements collide/intercept or not
    !(rect2.left > rect1.right || 
      rect2.right < rect1.left || 
      rect2.top > rect1.bottom ||
      rect2.bottom < rect1.top) ? 
      collide = true : collide = false;

    //moves the bullet out of canvas and out of sight
    //I have to move the bullet instead of removing it. This is becuase the bullet is a global variable and was initially
    //made outside of any observables. So if i were to remove it, it will be permantely removed from the canvas
    collide == true ? second.attr('cx', 7000).attr('cy', 7000) : undefined;

    //increases the game score if collision is true
    //This is coded here as well because we only want the score to increase when a collision happens
    collide == true ? gameScore = gameScore + score : undefined;
    scoreBoard.innerHTML = String(gameScore);


    //removes the asteroid. If the asteroid was a big asteroid, 
    //it will call the createSmallA function to create smaller asteroids
    //The createSmallA function is called here because we only want it if a big asteroid collides with a bullet
    collide == true ? first == asteroid ? 
    createSmallA(transformMatrix(asteroid).m41, transformMatrix(asteroid).m42, asteroid, theta, speed) : 
      first.elem.remove() : undefined;
    
    //reloads the game if the ship collides with any of the asteroids
    (collide == true) && (second == g) ? document.location.reload() : undefined;
    return collide;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////






  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Code for random moving Asteroids start here
  //The Observable that generates and moves all the asteroids
  let asteroidsObservable = Observable
    .interval(2000)
    //generates the random x or y value
    .map(() => {
      let x = 0;
      let y = 0;
      let chance = Math.floor(Math.random() * 2);
      return (chance == 0) ? 
      {x: (Math.floor(Math.random() * 561) + 20), y: 0} : 
      {x: 0, y: (Math.floor(Math.random() * 561) + 20)}; 
    })
    //Function that generates a random x and y value in the canvas
    .map(({x,y}) => {
      x = x;
      y = y;
      return (y != 0) ? 
      (Math.floor(Math.random() * 2) == 1) ? {x: 600, y: y} : {x: 0, y: y} : 
      (Math.floor(Math.random() * 2) == 1) ? {x: x, y: 600} : {x: x, y: 0};
    })
    //Function that generates a random angle based on the genrated x and y value
    //to help determine the direction the asteroid should move in
    //I know that the code below is very imperative due to the many if else statements
    //However, my logic to it is that i want the asteroids to always move towards the centre of the canvas,
    //or at least towards a logical direction. Hence, the if else statements which returns different angles.
    //If i were to just randomize it without these statements,
    //it is possible that the asteroid will always move out of the canvas whenenever it spawns
    //I have commented out a random theta below. If i wanted to make this less imparitive,
    //then i can just comment out all of my if else statements and uncomment the random theta.
    //But like i said, this will make the asteroids move in more non-logical directions,
    //which may make it harder for testing.
    .map(({x,y}) => {
      let theta = Math.floor(Math.random() * 361)

      // (y == 0) && (x != 0) ? theta = Math.floor(Math.random() * 121) + 120 :
      //   theta = Math.floor(Math.random() * 121) - 60;

      // (x == 0) && (y != 0) ? theta = Math.floor(Math.random() * 121) + 30 :
      //   theta = Math.floor(Math.random() * 121) + 210;
      

      //If the asteroid comes from the top left corner
      if ((x <= 150 && y == 0) || (x == 0 && y <= 150)) {
        theta = Math.floor(Math.random() * 51) + 110; 
      }
      //If the asteroid comes from the top right corner
      else if ((x >= 450 && y == 0) || (x == 600 && y <= 150)) {
        theta = Math.floor(Math.random() * 51) + 200;
      }
      //If the asteroid comes from the bottom right corner
      else if ((x >= 450 && y == 600) || (x == 600 && y >= 450)) {
        theta = Math.floor(Math.random() * 51) + 290;
      }
      //If the asteroid comes from the bottom left corner
      else if ((x <= 450 && y == 600) || (x == 0 && y >= 450)) {
        theta = Math.floor(Math.random() * 51) + 20;
      }
      //If the asteroid comes from the middle top
      else if ((x > 150 && x < 450) && (y == 0)) {
        theta = Math.floor(Math.random() * 121) + 120;
      }
      //If the asteroid comes from the middle right
      else if ((x == 600) && (y > 150 && y < 450)) {
        theta = Math.floor(Math.random() * 121) + 210;
      }
      //If the asteroid comes from the middle bottom
      else if ((x > 150 && x < 450) && (y == 600)) {
        theta = Math.floor(Math.random() * 61) - 30;
      }
      //If the asteroid comes from the middle left
      else if ((x == 0) && (y > 150 && y < 450)) {
        theta = Math.floor(Math.random() * 121) + 30;
      }

      return ({
        theta: theta,
        x: x,
        y: y
      })
    })
    

  //Observable that creates random big asteroids at random coordinates and moves them in random directions
  asteroidsObservable
    .subscribe( ({theta, x, y}) => {
      //creates the big asteroid
      //i create the asteroid inside the subscribe function so that an asteroid will be created after every given interval
      let a = new Elem(svg,'a')
        .attr("transform","translate(" + x + " " + y + ") rotate(180)");  
      let bigAsteroids = new Elem(svg, 'polygon', a.elem) 
        .attr("points","30,30 30,25 45,15 30,-30 15,-35, -35,-25 -40,20 -30,30 0,45 15,45")
        .attr("style","fill:black; stroke:white; stroke-width:1")
        .attr("theta", theta);

      //Animates and moves the big asteroid at a certain angle at the given intervals
      //Since the asteroid was created inside the subscribe, I have to check for collision inside here as well.
      //If i were to check for collision outside this observable, I wont be able to access the asteroid element, 
      //since it isn't a global variable
      let collisionobservable = Observable.interval(5)
        .takeUntil(Observable.interval(10000))
        .subscribe( () => { 
          //Levels of speeds
          let speedLevel = [0.5,0.8,1,1.2,1.4,1.6,1.8,2.0]
          //initial speed level
          let speed = speedLevel[0];

          let index = Number(level.innerHTML)
          //changes the speed according to the level
          //the changing of speed has to be done inside this observable or not the effect wont take place
          index  ? speed = speedLevel[index-1] : undefined;


          //changes the transform of the asteroid so that it can move in the correct direction 
          a.attr("transform",
          "translate(" + (Number(transformMatrix(a).m41) + ((Math.sin(degToRad(theta)))*speed)) + 
          " " + (Number(transformMatrix(a).m42) -  ((Math.cos(degToRad(theta)))*speed)) + ")" +
          "rotate(" + 180 + ")");
  
          //checks for collision between big asteroid and bullet
          collision(a,bullet, a, theta, 50, speed);      

          //checks for collisions between big asteroid and ship
          collision(a, g, a, theta, 0, speed);

          //checks if asteroid goes out of bounds
          outOfBounds(a);
          

        })
      }
    )

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
