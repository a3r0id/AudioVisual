/*
 * Author: Chad Groom - github.com/a3r0id
 * 
 * License: MIT
 * 
 * Version: 0.0.1
 * 
 * Description: A simple audio visualizer library for web documents.
 * 
 * Dependencies: None
 * 
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.AudioVisual = factory();
    }
}(this, function() {
    "use strict";
    
class AudioVisual
{
    constructor(musicElementSelector, refreshRate, onRender = () => {}, setAttributes = false)
    {
        // select the music element
        this.musicElement        = document.querySelector(musicElementSelector);
        
        // list of effect instances
        this.manipulatedElements = [];
        
        // create the audio context
        this.audioContext        = new (window.AudioContext || window.webkitAudioContext)();

        // create the audio source
        this.audioSource         = this.audioContext.createMediaElementSource(this.musicElement);
        
        // create the analyser
        this.analyser            = this.audioContext.createAnalyser();
        this.analyser.fftSize    = 2048;
        
        // connect the audio source to the analyser
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // create the data arrays
        this.currentBufferLength = this.analyser.frequencyBinCount;
        this.currentDataArray    = new Uint8Array(this.currentBufferLength);

        // create the data arrays
        this.receivedByteFrequencyData  = new Uint8Array(this.currentBufferLength);
        this.receivedByteTimeDomainData = new Uint8Array(this.currentBufferLength);
        
        // set the refresh rate
        this.refreshRate = refreshRate;

        // set the onRender function
        this.onRender = onRender;

        // set the setAttributes flag
        this.setAttributes = setAttributes;

        // effects object
        this.effects = {
            "amplitudeBlur": (element, id, coef=10) => {
                let blur = this.round2(this.data.amplitude * coef) + 0.75;
                blur     = blur > 0 ? blur : 0;
                element.style = `filter: blur(${blur}px);`;
                if (this.setAttributes) {
                    element.setAttribute("data-amplitude", this.data.amplitude);
                    element.setAttribute("data-avid", id);
                }
            },
            "hueFrequencyRotation": (element, id) => {
                element.style.filter = `hue-rotate(${this.round2((this.data.avgFreq / 255) * 180)}deg)`;
                if (this.setAttributes) {
                    element.setAttribute("data-avgfreq", this.data.avgFreq);
                    element.setAttribute("data-avid", id);
                }
            }
        }

        // data object 
        this.data = {
            avgFreq: 0,
            avgColor: 0,
            normFreq: 0,
            normColor: 0,
            amplitude: 0
        };        

        // start the render loop
        setInterval(this.render, this.refreshRate);

        console.log("AudioVisual initialized bound to " + musicElementSelector + " with refresh rate of " + refreshRate + "ms");
    }

    // utility to generate a unique id
    guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    // utility to round to 2 decimal places
    round2(f){
        return Math.round((f + Number.EPSILON) * 100) / 100;
    }

    // function to add an element to the list of elements to be manipulated on each render. returns the id of the unique effect instance.
    addEffect(effect, elementSelector){
        let id = this.guidGenerator();
        this.manipulatedElements.push({
            effect: effect,
            element: document.querySelector(elementSelector),
            id: id
        });
        return id;
    }

    // expand the frequency data
    frequencyExpansion = (Float32Array, multiplier) => {
        return Float32Array.map(function(x) { return x * multiplier; });
    }

    // render function
    render = () => 
    {
        // get the data
        this.analyser.getByteFrequencyData(this.receivedByteFrequencyData);
        this.analyser.getByteTimeDomainData(this.receivedByteTimeDomainData);

        // convert to float32
        let float32Freq = Float32Array.from(this.receivedByteFrequencyData);
        let float32Color = Float32Array.from(this.receivedByteTimeDomainData);

        // expand the frequency data
        let float32FreqExpanded = this.frequencyExpansion(float32Freq, 2);
        let float32ColorExpanded = this.frequencyExpansion(float32Color, 2);

        // get averages
        let avgFreq = Math.floor(float32FreqExpanded.reduce((a, b) => a + b, 0) / float32FreqExpanded.length * 1.00);
        let avgColor = Math.floor(float32ColorExpanded.reduce((a, b) => a + b, 0) / float32ColorExpanded.length * 1.00);

        // console.log(avgFreq, avgColor);
        // avg. color: 245 - 255
        // avg. freq: 30 - 255

        // normalize the values
        let normFreq  = (avgFreq - 30) / (255 - 30);
        let normColor = (avgColor - 245) / (255 - 245);
        let amplitude = normFreq * normColor;

        // set the data
        this.data = {
            avgFreq: avgFreq,
            avgColor: avgColor,
            normFreq: normFreq,
            normColor: normColor,
            amplitude: amplitude,
            float32Freq: float32Freq,
            float32Color: float32Color,
            float32FreqExpanded: float32FreqExpanded,
            float32ColorExpanded: float32ColorExpanded
        };

        // call the onRender function
        this.onRender(this);

        // apply the effects
        for (let i = 0; i < this.manipulatedElements.length; i++){
            let element = this.manipulatedElements[i];
            this.effects[element.effect](element.element, element.id);
        }
    }
}





  


    return AudioVisual;
}));