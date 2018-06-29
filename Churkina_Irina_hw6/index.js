function Character(life, damage, name, hasDrankMagicPotion) {
    this.life = life;
    this.damage = damage;
    this.maxLife = life;
    this.counter = 2;
    this.name = name;
    this.hasDrankMagicPotion = hasDrankMagicPotion || false
}

Character.prototype.fullfillLife = function() {
    this.life = this.maxLife;
}

Character.prototype.setLife = function(dmg) {
    if (this.hasDrankMagicPotion && this.shouldUseSkill() && this instanceof Monster) {
        console.log('one time of invulnerability for ' + this.name);
        this.hasDrankMagicPotion = false;
    } else {
        this.life -= dmg;
    }
}

Character.prototype.getDamage = function() {
    if (this.hasDrankMagicPotion && this.shouldUseSkill() && this instanceof Hero) {
        console.log('one time of double blow for ' + this.name);
        this.hasDrankMagicPotion = false;
        return this.damage * 2;
    }
    return this.damage;
}

Character.prototype.attack = function(obj) {
    obj.setLife(this.getDamage());
    return !obj.isAlive();
}

Character.prototype.isAlive = function() {
    return this.life > 0;
}

Character.prototype.getLife = function() {
    return this.life;
}

Character.prototype.shouldUseSkill = function() {
    return (this.life < this.maxLife / 2 && this.counter > 0);
}



function Hero() {
    Character.apply(this, arguments);
}

Hero.prototype = Object.create(Character.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.setLife = function(dmg) {
    if (this.shouldUseSkill()) {
        this.counter--;
    } else {
        this.life -= dmg;
    }
}

Hero.prototype.allowedNames = function() {
    return ['Arthur', 'Asteriks', 'Zena', 'Frederik'];
}

function Thief() {
    Hero.apply(this, arguments);
    this.type = 'Thief'
}
Thief.prototype = Object.create(Hero.prototype);
Thief.prototype.constructor = Thief;

function Warrior() {
    Hero.apply(this, arguments);
    this.type = 'Warrior'
}
Warrior.prototype = Object.create(Hero.prototype);
Warrior.prototype.constructor = Warrior;

function Wizard() {
    Hero.apply(this, arguments);
    this.type = 'Wizard'
}
Wizard.prototype = Object.create(Hero.prototype);
Wizard.prototype.constructor = Wizard;

function heroesFactory(type, name, trickiness) {
    let charTrickiness = trickiness || false;
    switch (type) {
        case 'Thief':
            return new Thief(150, 60, name, charTrickiness);
            break;
        case 'Warrior':
            return new Warrior(250, 70, name, charTrickiness);
            break;
        case 'Wizard':
            return new Wizard(200, 60, name, charTrickiness);
            break;
        default:
            return new Character(0, 0, name);
            break;
    }
}


function Monster() {
    Character.apply(this, arguments);
}

Monster.prototype = Object.create(Character.prototype);
Monster.prototype.constructor = Monster;


Monster.prototype.getDamage = function() {

    if (this.shouldUseSkill()) {
        this.counter--;
        return this.damage * 2;
    }

    return this.damage;
}

Monster.prototype.allowedNames = function() {
    return ['Uglister', 'Stinky', 'Feardor', 'Bloody'];
}

function monstersFactory(type, name, trickiness) {
    let charTrickiness = trickiness || false;

    switch (type) {
        case 'Goblin':
            return new Goblin(160, 40, name, charTrickiness);
            break;
        case 'OrcsCrowd':
            return new OrcsCrowd(250, 10, name, charTrickiness);
            break;
        case 'Vampire':
            return new Vampire(300, 60, name, charTrickiness);
            break;
        default:
            return new Character(0, 0, name);
            break;
    }
}

function Goblin(name) {
    Monster.apply(this, arguments);
    this.type = 'Goblin'
}

Goblin.prototype = Object.create(Monster.prototype);
Goblin.prototype.constructor = Goblin;

function OrcsCrowd(name) {
    Monster.apply(this, arguments);
    this.type = 'Orcs Crowd'
}
OrcsCrowd.prototype = Object.create(Monster.prototype);
OrcsCrowd.prototype.constructor = OrcsCrowd;

function Vampire(name) {
    Monster.apply(this, arguments);
    this.type = 'Vampire'
}
Vampire.prototype = Object.create(Monster.prototype);
Vampire.prototype.constructor = Vampire



function Tourney(membersMaxCount, membersList) {
    this.membersMaxCount = membersMaxCount;
    membersList.length > membersMaxCount ? this.membersList = membersList.slice(0, membersMaxCount) : this.membersList = membersList;

    this.startTourneyStage();
}

Tourney.prototype.getInitialMembersList = function() {
    return this.membersList;
}

Tourney.prototype.passFaceControl = function() {
    this.registeredMembers = this.getInitialMembersList().filter(function(member) {
        if (member.allowedNames && member.allowedNames().indexOf(member.name) != -1 && (member instanceof Monster || member instanceof Hero)) {
            return member;
        };
    })
    return this.registeredMembers;
}

Tourney.prototype.startTourneyStage = function(currentMembers) {
    this.currentMembersList = currentMembers || this.passFaceControl();
    if (this.currentMembersList.length < 2) {
        console.log('Winner is ' + currentMembers[0].type + ' - ' + currentMembers[0].name + '!');
        return
    }

    let size = 2;
    let contestants = [];
    for (let i = 0; i < Math.ceil(this.currentMembersList.length / size); i++) {
        contestants[i] = this.currentMembersList.slice((i * size), (i * size) + size);
    }

    this.makeAFight(contestants, this.currentMembersList);
}

Tourney.prototype.makeAFight = function(contestants, currentMembersList) {
    this.contestants = contestants.map(function(currentPair) {
        let newGame = new Game([currentPair[0], currentPair[1]]);
        let winner = newGame.fight();
        winner.fullfillLife();
        return winner
    })

    this.startTourneyStage(this.contestants);
}

function Game(players) {
    this.player1 = players[0];
    this.player2 = players[1];
}

Game.prototype.getFirstPlayer = function() {
    return this.player1;
}

Game.prototype.getSecondPlayer = function() {
    return this.player2;
}

Game.prototype.fight = function() {
    if (this.player2 == undefined) {
        return this.player1
    }
    while (this.player1.isAlive() && this.player2.isAlive()) {
        if (this.player1.attack(this.player2)) {
            return this.player1;
        } else if (this.player2.attack(this.player1)) {
            return this.player2;
        }
    }
}

var v = new monstersFactory('Vampire', 'Bloody', true);
var oc = new monstersFactory('OrcsCrowd', 'Feardor', true);
var wz = new heroesFactory('Wizard', 'Arthur');
var th = new heroesFactory('Thief', 'Asteriks', true);
var wr = new heroesFactory('Warrior', 'Zena');
var wr2 = new heroesFactory('Warrior', 'Frederic', true);
var gh = new monstersFactory('Ghost', 'Uglister');

var newTourney = new Tourney(9, [wr, th, v, wz, oc, wr2, gh]);
