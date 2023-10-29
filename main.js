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
    walker.speed = 1.2;
    walker.set_random_target();

    canvas_updated();
}

function draw() {
    update_millis();
    
    background(202, 163, 104);
    
    walker.update();
    walker.draw();
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

// Track

class Track {
    constructor() {
        this.position = createVector(0, 0);
        this.angle = 0;
        this.alpha = 255;
    }

    draw() {
        push();

        translate(this.position.x, this.position.y);
        rotate(this.angle);

        fill(0, this.alpha);
        noStroke();

        ellipse(-6, 0, 7, 6);
        ellipse(2, 0, 10, 9);

        pop();
    }

    update() {
        this.alpha -= (millis_since_last_frame / 15.0);
    }
}

// Walker

const TRACK_SIDE_LEFT = true;
const TRACK_SIDE_RIGHT = false;

class Walker {
    constructor() {
        this.position = createVector(0, 0);
        this.target = createVector(0, 0);

        this.angle = 0;
        this.speed = 0;

        this.millis_since_last_track = 0;
        this.millis_since_last_target_change = 0;

        this.tracks = [];

        this.last_track_side = TRACK_SIDE_LEFT;
        this.should_draw_target = false;
        this.should_draw_target = false;
    }
    
    draw() {
        if (this.should_draw_walker) {
            push();

            translate(this.position.x, this.position.y);
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

        for (const track of this.tracks) {
            track.draw();
        }
    }
    
    update() {
        this.update_angle();
        this.update_position();
        this.update_tracks();
        this.update_target();
    }
    
    update_angle() {
        let target_vector = createVector(this.target.x - this.position.x, this.target.y - this.position.y);
        let target_vector_angle = target_vector.heading();
        if (this.angle > target_vector_angle) {
            this.angle -= 0.05;
        } else if (this.angle < target_vector_angle) {
            this.angle += 0.05;
        }
    }
    
    update_position() {
        let speed_vector = p5.Vector.fromAngle(this.angle);
        speed_vector.setMag(this.speed);
        this.position.add(speed_vector);
        print(this.position);
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
        let track_spread = (this.last_track_side == TRACK_SIDE_LEFT ? -6 : 6);
        let orthogonal_vector = p5.Vector.fromAngle(orthogonal_angle);
        orthogonal_vector.setMag(track_spread);

        let track = new Track();
        track.position.x = this.position.x + orthogonal_vector.x;
        track.position.y = this.position.y + orthogonal_vector.y;
        track.angle = this.angle;
        this.tracks.push(track);

        this.last_track_side = !this.last_track_side;

        this.millis_since_last_track = 0;
    }
}