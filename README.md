<p align="center">
    <img src="public/logo.png" width="200" height="200" alt="Harmonia Logo"/>
</p>

<h1 align="center"><strong>Harmonia</strong></h1>

<p align="center">
    <a href="https://react.dev">
        <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)" alt="React"/>
    </a>
    <a href="https://www.typescriptlang.org/">
        <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    </a>
    <a href="https://redux.js.org/">
        <img src="https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white" alt="Redux"/>
    </a>
    <a href="https://tonejs.github.io/">
        <img src="https://img.shields.io/badge/tone.js-%2377EF1E.svg?style=for-the-badge&logo=apple-music&logoColor=black" alt="Tone.js"/>
    </a>
    <a href="https://opensheetmusicdisplay.github.io/">
        <img src="https://img.shields.io/badge/OSMD-%23F9A000.svg?style=for-the-badge&logo=exercism&logoColor=white" alt="OpenSheetMusicDisplay"/>
    </a>
    <a href="https://tailwindcss.com/">
        <img src="https://img.shields.io/badge/tailwind-%2318B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
    </a>
</p>

<h3 align="center">A Pattern-Based DAW with Structural Harmony</h3>

<p align="center">
    <a href="#key-features">Key Features</a>
    •
    <a href="#faq">FAQ</a>
    •
    <a href="#credits">Credits</a>
    •
    <a href="#credits">License</a>
    •
    <a href="https://brendanzelikman.github.io/harmonia">Live Demo</a>
</p>

<p align="center">
    <img src="public/screenshot.png" height="400"/>
</p>

# Key Features

<ul>
    <li>Pattern-based approach for quick and intuitive composition</li>
    <li>Integrated harmonic scaffolding with a dedicated scale editor</li>
    <li>High-quality instrumental samples powered by Ableton Live</li>
    <li>Customizable audio effects like reverb, chorus, and delay</li>
    <li>Streamlined user interface with a focus on accessibility</li>
    <li>Diversely curated presets of scales and patterns</li>
    <li>Project saving and loading with a custom .HAM file format</li>

</ul>

# FAQ

<h4><strong>What is Harmonia?</strong></h4>
<p>Harmonia is a pattern-based digital audio workstation (DAW) that allows users to quickly and intuitively compose music with a supportive harmonic scaffolding. It was created as a senior thesis project in computer science at Princeton University and it is entirely free and open-source.</p>

<h4><strong>What is a pattern-based DAW?</strong></h4>
<p>A pattern-based DAW is a virtual environment that allows users to compose music by creating and manipulating patterns in a grid-based timeline. As opposed to the piano roll of a traditional DAW, Harmonia implements a score-based editor that allows users to edit patterns in a more intuitive and expressive way.</p>

<h4><strong>How is the harmony expressive?</strong></h4>
<p>Our current visualizations of harmony are significantly limited and usually nonexistent within the context of a DAW. Harmonia aims to integrate our intuitive understandings of patterns with the necessary harmony scaffolding that allows us to effectively generalize them as a discrete set of notes.</p>

<h4><strong>Why are there two kinds of tracks?</strong></h4>
<p>In order to create a useful harmonic scaffolding, Harmonia uses a two-track system based on ScaleTracks and PatternTracks. Fundamentally, a ScaleTrack is responsible for defining harmony, whereas a PatternTrack is responsible for playing sound. All PatternTracks must be created in relation to a ScaleTrack, and all notes played by a PatternTrack will be automatically quantized within the scale defined by its corresponding ScaleTrack.</p>

<h4><strong>How was Harmonia created?</strong></h4>
<p>Harmonia was built with the following essential libraries:
    <ul>
        <li><a href="https://react.dev/">React</a> for creating the user interface</li>
        <li><a href="https://www.typescriptlang.org/">TypeScript</a> for syntax and typing</li>
        <li><a href="https://redux.js.org/">Redux</a> for state management</li>
        <li><a href="https://tonejs.github.io/">Tone.js</a> for generating web audio</li>
        <li><a href="https://opensheetmusicdisplay.github.io/">OpenSheetMusicDisplay</a> for sheet music notation</li>
        <li><a href="https://tailwindcss.com/">Tailwind CSS</a> for styling and configuration</li>
    </ul>
</p>

# Credits

<p>Harmonia was created by <a href="https://brendanzelikman.github.io/">Brendan Zelikman</a> for his senior thesis in computer science at Princeton University.</p>

<ul>
    <li>Thank you to <a href="https://dmitri.mycpanel.princeton.edu/">Dmitri Tymoczko</a> and <a href="https://github.com/jlumbroso/">Jérémie Lumbroso</a> for their invaluable guidance and advice.
    </li>
    <li>Thank you to <a href="https://github.com/drumnickydrum/">Nick Carbone</a> for providing inspiration with his <a href="https://www.sequencer64.com/">Sequencer64</a> project.
    </li>
    <li>
        Thank you to the Princeton University Computer Science Department for their funding and support.
    </li>
    <li>
        Thank you to <a href="https://www.ableton.com/en/live/">Ableton</a> for providing the high-quality audio samples used in Harmonia.
    </li>
    <li>
        And thank you! I hope you enjoy using Harmonia as much as I enjoyed creating it.
    </li>
</ul>

# License

Copyright (c) 2023 Brendan Zelikman

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
