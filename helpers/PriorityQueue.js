
class Element {
    constructor(element, prio){
        this.element = element;
        this.prio = prio;
    }
}


module.exports.PriorityQueue = class {
    constructor() {
        this.items = [];
    }

    enqueue(element, prio) {
        var item = new Element(element, prio);
        var contain = false;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].prio < prio) {
                this.items.splice(i, 0, item);
                contain = true;
            }
        }
        // has lowest priotity, add to end of queue
        if (!contain) {
            this.items.push(item);
        }
    }

    get() {
        return this.items;
    }
};