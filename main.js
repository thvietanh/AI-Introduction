const canvas = document.querySelector('canvas');
canvas.width = 800;
canvas.height = 800;
const context = canvas.getContext('2d');
const scale = 400;

const GRID_ROW = 30;
const GRID_COL = 30;

const grid = [];
let openSet = [];
let closedSet = [];
let start, end;
let start_x = 0, start_y = 0, end_x = GRID_COL - 1, end_y = GRID_ROW - 1;

let path = [];
let isPathFound = false;

class Cell {
    constructor(i,j){
        this.i = i;
        this.j = j;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.previous = undefined;
        this.neighbors = [];
        this.isWall = Math.random() < 0.4;
        this.cellScale = canvas.width / GRID_COL;
    }

    show(color=null){
        if (color) {
            context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b})`;
        } else {
            context.fillStyle = 'rgba(255, 255, 255)';
        }
        context.fillRect(this.i * this.cellScale, this.j * this.cellScale, this.cellScale, this.cellScale);
        context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        context.strokeRect(this.i * this.cellScale, this.j * this.cellScale, this.cellScale, this.cellScale);
    }

    addNeighbors(){
        let i = this.i;
        let j = this.j;
        if (j > 0) {
            this.neighbors.push(grid[i][j - 1]);
        }
        if (j < GRID_COL - 1) {
            this.neighbors.push(grid[i][j + 1]);
        }
        if (i > 0) {
            this.neighbors.push(grid[i - 1][j]);
        }
        if (i < GRID_ROW - 1) {
            this.neighbors.push(grid[i + 1][j]);
        }
    }
}

const heuristic = (a, b) => {
        let distance = Math.sqrt(Math.pow(a.i - b.i, 2) + Math.pow(a.j - b.j, 2)); //euclidean
        return distance;
}

const removeFromArray = (arr, x) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == x) {
            arr.splice(i, 1);
        }
    }
}

const setup = ()=>{
    for(let i = 0; i < GRID_ROW; i++){
        grid[i] = [];
        for(let j = 0; j < GRID_COL; j++){
            grid[i][j] = new Cell(i, j);
        }
    }
    for(let i = 0; i < GRID_ROW; i++){
        for(let j = 0; j < GRID_COL; j++){
            grid[i][j].addNeighbors();
        }
    }

    start = grid[start_x][start_y];
    end = grid[end_x][end_y];
    start.isWall = false;
    end.isWall = false;

    openSet.push(start);
}

const update = () => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(update);
    if(openSet.length > 0){
        let current_index = 0;
        for(let i = 0; i < openSet.length; i++){
            if(openSet[current_index].f > openSet[i].f){
                current_index = i;
            }
        }

        let current = openSet[current_index];

        if(!isPathFound){
            path = [];
            let temp = current;
            path.push(temp);
            while(temp.previous){
                path.push(temp.previous);
                temp = temp.previous;
            }
        }

        if(current === end){
            isPathFound = true;
        }

        if(!isPathFound){
            for (let i = 0; i < current.neighbors.length; i++) {
                const neighbor = current.neighbors[i];

                if (neighbor && !neighbor.isWall) {
                    if (!closedSet.includes(neighbor)) {
                        let tempG = current.g + 1;

                        if (openSet.includes(neighbor)) {
                            if (tempG < neighbor.g) {
                                neighbor.g = tempG;
                            }
                        } 
                        else {
                            neighbor.g = tempG;
                            openSet.push(neighbor);
                        }

                        neighbor.h = heuristic(neighbor, end);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.previous = current;
                    }
                }
            }

            removeFromArray(openSet, current);
            closedSet.push(current);
        }
    }
    else{
        isPathFound = true;
    }
    for (let i = 0; i < GRID_ROW; i++) {
        for (let j = 0; j < GRID_COL; j++) {
            grid[i][j].show();

            if (grid[i][j].isWall) {
                grid[i][j].show({r: 62, g: 62, b: 62});
            }
        }
    }

    for (let k = 0; k < path.length; k++) {
        path[k].show({r: 0, g: 0, b: 255});
    }

    start.show({r:0,g:0,b:255});
    end.show({r: 255, g: 0, b: 0});
}

setup();
update();

