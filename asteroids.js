"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300) rotate(180)");
    let rect = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:lime;stroke:purple;stroke-width:1");
    let bullet = new Elem(svg, 'circle')
        .attr("r", 3)
        .attr("style", "fill: white; stroke:white;stroke-width:1");
    const radToDeg = (rad) => rad * 180 / Math.PI + 90;
    const degToRad = (deg) => deg * Math.PI / 180;
    const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
    Observable.fromEvent(svg, "mousemove")
        .map(({ clientX, clientY }) => ({
        lookx: clientX - svg.getBoundingClientRect().left,
        looky: clientY - svg.getBoundingClientRect().top,
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42
    }))
        .map(({ lookx, looky, x, y }) => g.attr("transform", "translate(" + x + " " + y + ")" + "rotate(" + radToDeg(Math.atan2(looky - y, lookx - x)) + ")"))
        .subscribe((g) => console.log(g.attr("transform")));
    let animatedBullet = () => {
        let angle = Number(bullet.attr('angle'));
        Observable.interval(1)
            .takeUntil(Observable.interval(1200))
            .subscribe(() => bullet
            .attr('cx', Number(bullet.attr('cx')) + ((Math.sin(degToRad(angle))) * 2.5))
            .attr('cy', Number(bullet.attr('cy')) - ((Math.cos(degToRad(angle))) * 2.5)));
    };
    let bulletObservable = Observable.fromEvent(svg, "mousedown")
        .map(({ clientX, clientY }) => ({
        lookx: clientX - svg.getBoundingClientRect().left,
        looky: clientY - svg.getBoundingClientRect().top,
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
    }))
        .map(({ lookx, looky, x, y }) => {
        let angle = radToDeg(Math.atan2(Number(looky) - Number(y), Number(lookx) - Number(x)));
        bullet.attr("cx", x).attr("cy", y).attr("lookx", lookx).attr("looky", looky).attr("angle", angle);
    })
        .subscribe(animatedBullet);
    let keyObservable = Observable.fromEvent(document, "keydown");
    keyObservable
        .map((k) => {
        return k.keyCode == 87 ? g.attr("transform", "translate(" + transformMatrix(g).m41 + " " + (Number(transformMatrix(g).m42) - 20) + ")" +
            "rotate(" + 0 + ")") : undefined;
    })
        .subscribe(() => {
        return (transformMatrix(g).m42 == 0) ? g.attr("transform", "translate(" + transformMatrix(g).m41 + " " + (600 - 20) + ")" +
            "rotate(" + 0 + ")") : undefined;
    });
    keyObservable
        .map((k) => {
        return k.keyCode == 83 ? g.attr("transform", "translate(" + transformMatrix(g).m41 + " " + (Number(transformMatrix(g).m42) + 20) + ")" +
            "rotate(" + 180 + ")") : undefined;
    })
        .subscribe(() => {
        return (transformMatrix(g).m42 == 600) ? g.attr("transform", "translate(" + transformMatrix(g).m41 + " " + (0 + 20) + ")" +
            "rotate(" + 180 + ")") : undefined;
    });
    keyObservable
        .map((k) => {
        return k.keyCode == 68 ? g.attr("transform", "translate(" + (Number(transformMatrix(g).m41) + 20) + " " + transformMatrix(g).m42 + ")" +
            "rotate(" + 90 + ")") : undefined;
    })
        .subscribe(() => {
        return (transformMatrix(g).m41 == 600) ? g.attr("transform", "translate(" + (0 + 20) + " " + transformMatrix(g).m42 + ")" +
            "rotate(" + 90 + ")") : undefined;
    });
    keyObservable
        .map((k) => {
        return k.keyCode == 65 ? g.attr("transform", "translate(" + (Number(transformMatrix(g).m41) - 20) + " " + transformMatrix(g).m42 + ")" +
            "rotate(" + 270 + ")") : undefined;
    })
        .subscribe(() => {
        return (transformMatrix(g).m41 == 0) ? g.attr("transform", "translate(" + (600 - 20) + " " + transformMatrix(g).m42 + ")" +
            "rotate(" + 270 + ")") : undefined;
    });
    let outOfBounds = (asteroid) => {
        return (transformMatrix(asteroid).m41 >= 650) || (transformMatrix(asteroid).m41 <= -50) ||
            (transformMatrix(asteroid).m42 >= 650) || (transformMatrix(asteroid).m41 <= -50) ?
            asteroid.elem.remove() : undefined;
    };
    let gameScore = 0;
    let initialScore = 0;
    const scoreBoard = document.getElementById("score");
    const level = document.getElementById("level");
    let increaseLevel = Observable.interval(10)
        .map(() => {
        gameScore - initialScore >= 2000 ? level.innerHTML = String(Number(level.innerHTML) + 1) : undefined;
        gameScore - initialScore >= 2000 ? initialScore = initialScore + 2000 : undefined;
    });
    increaseLevel.subscribe(() => {
        console.log(gameScore);
    });
    let createSmallA = (x, y, asteroid, theta, speed) => {
        asteroid.elem.remove();
        let b = new Elem(svg, 'a')
            .attr("transform", "translate(" + (x - 10) + " " + (y - 10) + ") rotate(180)");
        let smallAsteroidA = new Elem(svg, 'polygon', b.elem)
            .attr("points", "0,0 10,20 40,20 30,0")
            .attr("style", "fill:black; stroke:white; stroke-width:1");
        let c = new Elem(svg, 'a')
            .attr("transform", "translate(" + (x + 10) + " " + (y) + ") rotate(180)");
        let smallAsteroidB = new Elem(svg, 'polygon', c.elem)
            .attr("points", "0,0 10,20 40,20 30,0")
            .attr("style", "fill:black; stroke:white; stroke-width:1");
        let d = new Elem(svg, 'a')
            .attr("transform", "translate(" + (x - 10) + " " + (y + 10) + ") rotate(180)");
        let smallAsteroidC = new Elem(svg, 'polygon', d.elem)
            .attr("points", "0,0 10,20 40,20 30,0")
            .attr("style", "fill:black; stroke:white; stroke-width:1");
        Observable.interval(5)
            .takeUntil(Observable.interval(10000))
            .subscribe(() => {
            b.attr("transform", "translate(" + (Number(transformMatrix(b).m41) + ((Math.sin(degToRad(theta))) * speed)) +
                " " + (Number(transformMatrix(b).m42) - ((Math.cos(degToRad(theta))) * speed)) + ")" +
                "rotate(" + 0 + ")");
            c.attr("transform", "translate(" + (Number(transformMatrix(c).m41) + ((Math.sin(degToRad(theta + 10))) * speed)) +
                " " + (Number(transformMatrix(c).m42) - ((Math.cos(degToRad(theta + 10))) * speed)) + ")" +
                "rotate(" + 90 + ")");
            d.attr("transform", "translate(" + (Number(transformMatrix(d).m41) + ((Math.sin(degToRad(theta - 10))) * 0.5)) +
                " " + (Number(transformMatrix(d).m42) - ((Math.cos(degToRad(theta - 10))) * speed)) + ")" +
                "rotate(" + 180 + ")");
            outOfBounds(b);
            outOfBounds(c);
            outOfBounds(d);
            collision(b, bullet, asteroid, theta, 50, speed);
            collision(c, bullet, asteroid, theta, 50, speed);
            collision(d, bullet, asteroid, theta, 50, speed);
            collision(b, g, asteroid, theta, 0, speed);
            collision(c, g, asteroid, theta, 0, speed);
            collision(d, g, asteroid, theta, 0, speed);
        });
    };
    let collision = (first, second, asteroid, theta, score, speed) => {
        let rect1 = first.elem.getBoundingClientRect();
        let rect2 = second.elem.getBoundingClientRect();
        let collide = false;
        !(rect2.left > rect1.right ||
            rect2.right < rect1.left ||
            rect2.top > rect1.bottom ||
            rect2.bottom < rect1.top) ?
            collide = true : collide = false;
        collide == true ? second.attr('cx', 7000).attr('cy', 7000) : undefined;
        collide == true ? gameScore = gameScore + score : undefined;
        scoreBoard.innerHTML = String(gameScore);
        collide == true ? first == asteroid ?
            createSmallA(transformMatrix(asteroid).m41, transformMatrix(asteroid).m42, asteroid, theta, speed) :
            first.elem.remove() : undefined;
        (collide == true) && (second == g) ? document.location.reload() : undefined;
        return collide;
    };
    let asteroidsObservable = Observable
        .interval(2000)
        .map(() => {
        let x = 0;
        let y = 0;
        let chance = Math.floor(Math.random() * 2);
        return (chance == 0) ?
            { x: (Math.floor(Math.random() * 561) + 20), y: 0 } :
            { x: 0, y: (Math.floor(Math.random() * 561) + 20) };
    })
        .map(({ x, y }) => {
        x = x;
        y = y;
        return (y != 0) ?
            (Math.floor(Math.random() * 2) == 1) ? { x: 600, y: y } : { x: 0, y: y } :
            (Math.floor(Math.random() * 2) == 1) ? { x: x, y: 600 } : { x: x, y: 0 };
    })
        .map(({ x, y }) => {
        let theta = Math.floor(Math.random() * 361);
        if ((x <= 150 && y == 0) || (x == 0 && y <= 150)) {
            theta = Math.floor(Math.random() * 51) + 110;
        }
        else if ((x >= 450 && y == 0) || (x == 600 && y <= 150)) {
            theta = Math.floor(Math.random() * 51) + 200;
        }
        else if ((x >= 450 && y == 600) || (x == 600 && y >= 450)) {
            theta = Math.floor(Math.random() * 51) + 290;
        }
        else if ((x <= 450 && y == 600) || (x == 0 && y >= 450)) {
            theta = Math.floor(Math.random() * 51) + 20;
        }
        else if ((x > 150 && x < 450) && (y == 0)) {
            theta = Math.floor(Math.random() * 121) + 120;
        }
        else if ((x == 600) && (y > 150 && y < 450)) {
            theta = Math.floor(Math.random() * 121) + 210;
        }
        else if ((x > 150 && x < 450) && (y == 600)) {
            theta = Math.floor(Math.random() * 61) - 30;
        }
        else if ((x == 0) && (y > 150 && y < 450)) {
            theta = Math.floor(Math.random() * 121) + 30;
        }
        return ({
            theta: theta,
            x: x,
            y: y
        });
    });
    asteroidsObservable
        .subscribe(({ theta, x, y }) => {
        let a = new Elem(svg, 'a')
            .attr("transform", "translate(" + x + " " + y + ") rotate(180)");
        let bigAsteroids = new Elem(svg, 'polygon', a.elem)
            .attr("points", "30,30 30,25 45,15 30,-30 15,-35, -35,-25 -40,20 -30,30 0,45 15,45")
            .attr("style", "fill:black; stroke:white; stroke-width:1")
            .attr("theta", theta);
        let collisionobservable = Observable.interval(5)
            .takeUntil(Observable.interval(10000))
            .subscribe(() => {
            let speedLevel = [0.5, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2.0];
            let speed = speedLevel[0];
            let index = Number(level.innerHTML);
            index ? speed = speedLevel[index - 1] : undefined;
            a.attr("transform", "translate(" + (Number(transformMatrix(a).m41) + ((Math.sin(degToRad(theta))) * speed)) +
                " " + (Number(transformMatrix(a).m42) - ((Math.cos(degToRad(theta))) * speed)) + ")" +
                "rotate(" + 180 + ")");
            collision(a, bullet, a, theta, 50, speed);
            collision(a, g, a, theta, 0, speed);
            outOfBounds(a);
        });
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map