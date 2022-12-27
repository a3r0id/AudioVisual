# AudioVisual
 A simple library for manipulating CSS filters/effects with document audio amplitude/frequency/color.

## Live Examples

### [Amplitude Blur](https://a3r0id.github.io/AudioVisual/example_amplitudeBlur.html)

### [Hue-Frequency Rotation](https://a3r0id.github.io/AudioVisual/example_hueFrequencyRotation.html)

-----

## Basic Implementation

### Include the script
```html
    <script type="text/javascript" src="audioVisual.js"></script>
```

### Create an audio element
```html
    <audio loop preload="auto" id="music" controls>
        <source src="#" type="audio/mpeg">
    </audio>
```

### Initialize the object on the audio element - Amplitude-Blur Effect
```js
    var audioVisual = new AudioVisual("#music", 10);
    var effect      = audioVisual.addEffect("amplitudeBlur", "html");
```

### Initialize the object on the audio element - Hue Rotation by Freq. Effect
```js
    var audioVisual = new AudioVisual("#music", 10);
    var effect      = audioVisual.addEffect("hueFrequencyRotation", "html");
```

-----

## Contribution

Feel free to contribute, you will be credited appropriately. Simply submit a PR!

