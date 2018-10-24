class Behavior {
  constructor(c, s, a, w) {
    this.stick = c;
    this.avoid = s;
    this.align = a;
    this.wandr = w;
  }

  //TODO: finish this later
  process(c, s, a, w) {
    c.mult(this.stick);
    s.mult(this.avoid);
    a.mult(this.align);
    w.mult(this.wandr);
    var mix = p5.Vector.add(c, s);
    mix.add(a);
    mix.add(w);
    return mix;
  }
}

//Transition conditions for a species is some type of function
class Transition {
  constructor(filter, species) {
    this.condition = filter;
    this.endstate = species;
  }
}

//Eventually this will need to also be/link to a document elemnent
//so that we can interact with these variables
class Species {
  constructor() {
    this.size = 5;
    this.range = 20;
    this.inter = {};
    this.trans = {};
  }

  putBehavior(species, behavior) {
    this.trans[species] = behavior;
  }

  analyze(locale) { //TODO: finish this stuff
    var satisfied = false;
    for(var i = 0; i < this.trans.length && !satisfied; i++) {

    }
  }
}

class Agent {
  constructor(x, y, species) {
    this.pos = sim.createVector(x, y);
    this.vel = sim.createVector();
    this.acc = sim.createVector();
    this.species = species;
    this.locale = {};
  }

  show(sketch) {
    sketch.ellipse(this.pos.x, this.pos.y, this.species.size, this.species.size);
  }

  processLocale() {
    //Reset forces acting on agent
    this.acc.set(0, 0);
    //Get the species keys from the locale
    var keys = Object.keys(this.locale);
    //If none, do nothing
    if(keys.length == 0)
      return;
    //Count agents for normalization
    var count = 0;
    for(var type of keys) {
      //Determine proper interaction for agent
      var behavior = this.species.inter[type];
      //Calculate base vectors
      var cohes = cohesionVector(this, this.locale[type]);
      var separ = separationVector(this, this.locale[type]);
      var align = alignmentVector(this, this.locale[type]);
      var wandr = wanderVector(this, .5);
      //Apply behavioral weights
      var combo = behavior.process(cohes, separ, align, wandr);
      //Weight by the number of agents of that species
      combo.mult(this.locale[type].length);
      //Add to total agent count for normalization
      count += this.locale[type].length;
      //Add to the acceleration
      this.acc.add(combo);
    }
    //Normalize by the total count
    this.acc.mult(1.0/count);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
  }
}

//Functions for computing group interation vectors
var cohesionVector = function(focus, agents) {
  var vect = sim.createVector();
  for(let ag of agents) {
    vect.add(ag.pos);
  }
  vect.mult(1.0/agents.length); //Vect is the centroid
  vect.sub(focus.pos); //Vect points from focus to centroid
  vect.normalize();
  return vect;
}

var separationVector = function(focus, agents) {
  var vect = sim.createVector();
  for(let ag of agents) {
    var sep = p5.Vector.sub(focus.pos, ag.pos);
    sep.normalize();
    vect.add(sep);
  }
  return vect;
}

var alignmentVector = function(focus, agents) {
  var vect = sim.createVector();
  for(let ag of agents) {
    var dir = ag.vel.copy();
    dir.normalize();
    vect.add(dir);
  }
  vect.normalize();
  return vect;
}

var wanderVector = function(agent, range) {
  var vect = p5.Vector.fromAngle(agent.vel.heading() + sim.random(-range, range));
  return vect;
}