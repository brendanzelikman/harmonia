<p align="center">
    <img src="public/logo.png" width="200" height="200" alt="Harmonia Logo"/>
</p>

<h1 align="center">Harmonia: The Scale-Based DAW</h1>

<!-- Badges -->
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

<p align="center">
<a href="#faq">FAQ</a>
•
<a href="#getting-started">Getting Started</a>
•
<a href="#acknowledgements">Acknowledgements</a>
•
<a href="#license">License</a>
•
<a href="https://brendanzelikman.github.io/harmonia">Visit the Website</a>
</p>

<img src="public/screenshot.png"/>

# FAQ

<h3><strong>What is Harmonia?</strong></h3>
<p>Harmonia is a tool for musical composition built around manipulating patterns within different scales. Whereas traditional DAWs use only a single kind of MIDI track, Harmonia uses two different types: the Scale Track and the Pattern Track.
By arranging Pattern Tracks within recursively nestable Scale Tracks, the user can easily create intricate musical structures and instantly transpose or modulate any section.</p>

<h3><strong>What is N, T, and t?</strong></h3>
<p>Harmonia uses a custom notation system to represent different kinds of transpositions. Following Dmitri Tymoczko's convention, a big "T" refers to transposition along a track scale, and a little "t" refers to transposition along the chord, i.e. the intrinsic scale of the musical object. A big "N" refers to transposition along the chromatic scale.</p>

<h3><strong>Is there a tutorial or manual available?</strong></h3>
<p>Yes! The website comes with a built-in onboarding tour that can be accessed at any time by clicking the Question Mark button in the top right corner of the screen. Additionally, the full list of shortcuts can be toggled by pressing the "?" key.</p>

<h3><strong>Can I use Harmonia with my current DAW/scorewriter?</strong></h3>
<p>Yes, and please do! Harmonia is designed to be used in conjunction with other DAWs and scorewriters. You can export all of your scales and patterns to both MIDI and MusicXML files, and you can also record your project as a WAV file.</p>

# Getting Started

<h3><strong>How do I use Harmonia?</strong></h3>
<p>
Using Harmonia is easy! A typical workflow can look like this:

    1. Create a Scale Track and customize its scale.

    (1.5.) Create a nested Scale Track and repeat as necessary.

    2. Create a Pattern Track and customize its instrument.

    3. Create a Pattern or select a preset from the dropdown menu.

    4. Arrange the Pattern as a Clip within the Pattern Track.

    (4.5.) Arrange a Transposition within any Track.

    5. Press play and enjoy!

</p>

# Acknowledgements

<p>Harmonia was created by <a href="https://brendanzelikman.github.io/">Brendan Zelikman</a> for his senior thesis at Princeton University with the following essential libraries:</p>

<ul>
    <li><a href="https://react.dev/">React</a> for creating the user interface.</li>
    <li><a href="https://www.typescriptlang.org/">TypeScript</a> for syntax and typing.</li>
    <li><a href="https://redux.js.org/">Redux</a> for state management.</li>
    <li><a href="https://tonejs.github.io/">Tone.js</a> for web audio.</li>
    <li><a href="https://opensheetmusicdisplay.github.io/">OpenSheetMusicDisplay</a> for sheet music notation.</li>
    <li><a href="https://tailwindcss.com/">TailwindCSS</a> for styling and configuration.</li>
    <li><a href="https://github.com/adazzle/react-data-grid">react-data-grid</a> for a virtualizable timeline.
</ul>

Additionally, the following people were instrumental in the creation and success of this project:

<ul>
    <li>Thank you to <a href="https://dmitri.mycpanel.princeton.edu/">Dmitri Tymoczko</a>, the primary advisor and mentor for this project, who not only planted the seed for this project but also continually watered it along the way.
    <li>Thank you to <a href="https://github.com/jlumbroso/">Jérémie Lumbroso</a> for his sincere support and technical advice.
    </li>
    <li>Thank you to <a href="https://github.com/drumnickydrum/">Nick Carbone</a> for providing an initial burst of inspiration with his <a href="https://www.sequencer64.com/">Sequencer64</a> project.
    </li>
</ul>
</p>

# License

Copyright (c) 2023 Brendan Zelikman

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
