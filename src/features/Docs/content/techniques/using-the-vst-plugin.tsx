import {
  DocsLink,
  DocsList,
  DocsParagraph,
  DocsSection,
} from "../../components";

export function UsingTheVSTPluginDocsContent() {
  return (
    <>
      <DocsSection
        question="What is the VST Plugin?"
        answer={
          <>
            <DocsParagraph>
              The Harmonia "Plug and Play" VST plugin is a virtual instrument
              that allows you to send MIDI data from Harmonia to any other DAW.
              This means that you can use Harmonia to control any other
              instrument or synthesizer and send over changes in real-time! The
              plugin works by binding a track in Harmonia to a track in your DAW
              and automatically scheduling your notes to be played by the track
              using a UDP connection.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How do I use the VST Plugin?"
        answer={
          <>
            <DocsParagraph>
              In order to use the plugin, you must sign in as a Virtuoso user
              and download both the Desktop App and the VST Plugin from your
              Profile. Since the plugin relies on establishing a UDP connection
              over your local network, you will not be able to use the plugin
              using the website alone. Once you have installed and opened both
              of these applications, you can follow these steps:
            </DocsParagraph>

            <DocsList
              numerical
              ie
              items={[
                {
                  title: "Open the Desktop App",
                  description: `Open the Desktop App and sign in with your account.`,
                },
                {
                  title: "Prepare a Pattern Track",
                  description: `Select "Connect to Plugin" from a Pattern Track dropdown menu and input a channel number from 1 to 16.`,
                },
                {
                  title: "Connect to the Plugin",
                  description:
                    "Select the same channel number from the VST plugin dropdown menu.",
                },
                {
                  title: "Schedule Your Notes",
                  description: `Select "Flush to Plugin" from the Pattern Track dropdown menu or change any Clips to schedule your MIDI data.`,
                },
              ]}
            />
            <DocsParagraph>
              Voila! Your plugin should now be connected and play the
              appropriate notes whenever your DAW reaches the corresponding
              position in the timeline. The website will automatically
              synchronize with the plugin whenever the track or its clips are
              changed.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="I'm having issues!"
        answer={
          <>
            <DocsParagraph>
              Sorry to hear that! Here are some common issues that you may
              encounter:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "The Plugin isn't Showing",
                  description: (
                    <>
                      Make sure that your DAW accepts VST3 plugins and that you
                      have installed the plugin in the correct location.
                    </>
                  ),
                },
                {
                  title: "The Plugin isn't Connecting",
                  description: (
                    <>
                      Make sure that you are using the Desktop App connected to
                      the same network as your DAW and that the channel number
                      is not already in use by another track.
                    </>
                  ),
                },
                {
                  title: "The Plugin isn't Playing",
                  description: (
                    <>
                      Make sure that you have flushed the notes to the plugin
                      and that your track can play MIDI data from other sources.
                      If that doesn't work, try creating a send track to route
                      the MIDI data to another instrument.
                    </>
                  ),
                },
                {
                  title: "The Plugin is Choppy",
                  description: (
                    <>
                      For currently unknown reasons, the MIDI data may be choppy
                      when using the plugin in Ableton Live. In this case, try
                      inserting a MIDI effect before the instrument like a "MIDI
                      Monitor" and seeing what happens.
                    </>
                  ),
                },
              ]}
            />
          </>
        }
      />
    </>
  );
}
