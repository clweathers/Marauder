let start_frame_millis = 0;
let millis_since_start = 0;
let millis_since_last_frame = 0;
let previous_frame_millis = 0;

let walker;

function setup() {
    createCanvas(windowWidth, windowHeight);

    walker = new Walker();
    walker.position.x = width / 2;
    walker.position.y = height / 2;
    walker.speed = 2.6;
    walker.set_random_target();

    canvas_updated();
}

function draw() {
    update_millis();
    
    background(202, 163, 104);
    
    walker.update();
    walker.draw();

    // Debug
    //drawDebugTracks();
}

function canvas_updated() {

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    canvas_updated();
}

function update_millis() {
    if (start_frame_millis == 0) {
        start_frame_millis = millis();
    }
    
    millis_since_start = millis() - start_frame_millis;
    millis_since_last_frame = millis() - previous_frame_millis;
    previous_frame_millis = millis();
}

function keyPressed() {  
    if (key == 't' || key == 'T') {
        walker.should_draw_target = !walker.should_draw_target;
    } else if (key == 'w' || key == 'W') {
        walker.should_draw_walker = !walker.should_draw_walker;
    }
}

// Side

const Side = Object.freeze({
    Left: false,
    Right: true
})

// Track

class Track {
    constructor() {
        this.alpha = 255;
        this.angle = 0;
        this.position = createVector(0, 0);
        this.side = Side.Left;
    }

    draw() {
        push();

        fill(45, 13, 18, this.alpha);
        noStroke();

        translate(this.position);
        rotate(this.angle);

        // Mirror vertically for right-side tracks.
        if (this.side == Side.Right) {
            scale(1, -1);
        }

        this.drawHeel();
        translate(20, 0);
        this.drawSole();

        pop();
    }

    drawHeel() {
        beginShape();

        // "Real" points
        curveVertex(6, 0);
        curveVertex(7, 7);
        curveVertex(0, 6);
        curveVertex(-6, 3);
        curveVertex(-7, 0);
        curveVertex(-6, -3);
        curveVertex(0, -6);
        curveVertex(6, -6);

        // Closing and guide points
        curveVertex(6, 0);
        curveVertex(7, 7);
        curveVertex(0, 6);

        endShape();
    }

    drawSole() {
        beginShape();

        // "Real" points
        curveVertex(17, 0);
        curveVertex(10, 9);
        curveVertex(0, 11);
        curveVertex(-8, 9);
        curveVertex(-11, 0);
        curveVertex(-8, -8);
        curveVertex(0, -11);
        curveVertex(8, -9);

        // Closing and guide points
        curveVertex(17, 0);
        curveVertex(10, 9);
        curveVertex(0, 11);

        endShape();
    }

    update() {
        this.alpha -= (millis_since_last_frame / 9.0);
    }
}

// Walker

class Walker {
    constructor() {
        this.position = createVector(0, 0);
        this.target = createVector(0, 0);

        this.angle = 0;
        this.speed = 0;

        this.millis_since_last_track = 0;
        this.millis_since_last_target_change = 0;

        this.tracks = [];

        this.last_track_side = Side.Left;
        this.should_draw_target = false;
        this.should_draw_target = false;
    }
    
    draw() {
        if (this.should_draw_walker) {
            push();

            translate(this.position);
            rotate(this.angle);

            fill(255);
            stroke(0);
            strokeWeight(3);
            line(0, 0, 15, 0);
            circle(0, 0, 20);

            pop();
        }

        if (this.should_draw_target) {
            push();

            fill(255, 0, 0);
            stroke(255, 0, 0);
            circle(this.target.x, this.target.y, 20);

            pop();
        }

        this.tracks.forEach((track) => track.draw());
    }
    
    update() {
        this.update_angle();
        this.update_position();
        this.update_tracks();
        this.update_target();
    }
    
    update_angle() {
        let turn_speed = 0.05;

        let target_vector = p5.Vector.sub(this.target, this.position);
        let target_vector_angle = target_vector.heading();
        let angle_difference = abs(this.angle - target_vector_angle);

        let turn_amount = min(turn_speed, angle_difference);

        if (this.angle > target_vector_angle) {
            this.angle -= turn_amount;
        } else if (this.angle < target_vector_angle) {
            this.angle += turn_amount;
        }
    }
    
    update_position() {
        let speed_vector = p5.Vector.fromAngle(this.angle);
        speed_vector.setMag(this.speed);
        this.position.add(speed_vector);
    }
    
    update_tracks() {
        for (let index = this.tracks.length - 1; index >= 0; index--) {
        let track = this.tracks[index];
            track.update();

            if (track.alpha < 0) {
                this.tracks.splice(index, 1);
            }
        }

        if (this.millis_since_last_track > 380) {
            this.add_track();
        }

        this.millis_since_last_track += millis_since_last_frame;
    }
    
    update_target() {
        if (this.millis_since_last_target_change > 5000) {
            this.set_random_target();
            this.millis_since_last_target_change = 0;
        }

        this.millis_since_last_target_change += millis_since_last_frame;
    }

    set_random_target() {
        this.target.x = random(width);
        this.target.y = random(height);
    }
    
    add_track() {
        let orthogonal_angle = this.angle + HALF_PI;
        let track_spread = (this.last_track_side == Side.Left ? -10 : 10);
        let orthogonal_vector = p5.Vector.fromAngle(orthogonal_angle);
        orthogonal_vector.setMag(track_spread);

        let track = new Track();
        track.angle = this.angle;
        track.position = p5.Vector.add(this.position, orthogonal_vector);
        track.side = this.last_track_side;
        this.tracks.push(track);

        this.last_track_side = !this.last_track_side;

        this.millis_since_last_track = 0;
    }
}

// Debug

// Draw a few variations of tracks to make it easier to tweak them.
function drawDebugTracks() {
    const up_angle = 3 * PI / 2;
    const up_track_y = 100;
    const zero_track_x = 200;

    let test_left_up_track;
    test_left_up_track = new Track();
    test_left_up_track.angle = up_angle;
    test_left_up_track.position.set(50, up_track_y);
    test_left_up_track.side = Side.Left;

    let test_left_zero_track;
    test_left_zero_track = new Track();
    test_left_zero_track.angle = 0;
    test_left_zero_track.position.set(zero_track_x, 50);
    test_left_zero_track.side = Side.Left;

    let test_right_up_track;
    test_right_up_track = new Track();
    test_right_up_track.angle = up_angle;
    test_right_up_track.position.set(100, up_track_y);
    test_right_up_track.side = Side.Right;

    let test_right_zero_track;
    test_right_zero_track = new Track();
    test_right_zero_track.angle = 0;
    test_right_zero_track.position.set(zero_track_x, 100);
    test_right_zero_track.side = Side.Right;

    test_left_up_track.draw();
    test_left_zero_track.draw();
    test_right_up_track.draw();
    test_right_zero_track.draw();
}
