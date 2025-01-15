import convnetjs from "./convnet-min.js";
import fs from "fs";

type LayerTypes = {
    type: string,
    activation?: string,
    out_depth?: number,
    num_neurons?: number,
    out_sx?: number,
    out_sy?: number,
    num_classes?: number
}

// Get the gene expression data
const content = fs.readFileSync("./GeneExpressionData.txt").toString();
// console.log(content);

// Initialize the neural network
const layer_defs: LayerTypes[] = [];
const z = 10;

// Input layer
layer_defs.push({type: 'input', out_sx: 1, out_sy: 1, out_depth: z});

// Encoder layers
// layer_defs.push({type: 'fc', num_neurons: Math.floor(z / 2), activation: 'relu'});
// layer_defs.push({type: 'fc', num_neurons: Math.floor(z / 4), activation: 'relu'});

// Latent space (bottleneck)
layer_defs.push({type: 'fc', num_neurons: Math.floor(1), activation: 'relu'});

// Decoder layers
// layer_defs.push({type: 'fc', num_neurons: Math.floor(z / 4), activation: 'relu'});
// layer_defs.push({type: 'fc', num_neurons: Math.floor(z / 2), activation: 'relu'});

// Output layer (reconstruction)
layer_defs.push({type: 'regression', num_neurons: z});

// Create the network
var net = new convnetjs.Net();
net.makeLayers(layer_defs);

const trainer = new convnetjs.Trainer(net, {
    method: 'adam', // Optimizer (adam, adagrad, etc.)
    learning_rate: 0.5, // Learning rate
    l2_decay: 0.01, // Regularization
    batch_size: 10, // Batch size
    // momentum: 0.9 // Momentum for gradient descent
});

const training_data = new Array(10).fill(0).map((e, i) => new Array(z).fill(i));
console.log(training_data);

for (var epoch = 0; epoch < 10000; epoch++) { // Number of epochs
    for (var i = 0; i < training_data.length; i++) {
        var x = new convnetjs.Vol(training_data[i]); // Input data
        // console.log("Data: ", x);
        trainer.train(x, training_data[i]); // Train with target = input
    }
}

var latent_features = [];
for (var i = 0; i < training_data.length; i++) {
    var x = new convnetjs.Vol(training_data[i]);
    const y = net.forward(x);
    console.log("Input output", y.w, training_data[i]);
    const bottleneck_layer = net.layers[3]; // Replace with the bottleneck layer index
    latent_features.push(bottleneck_layer.out_act.w);
}

