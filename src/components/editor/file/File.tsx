import { EditorFileProps } from ".";
import * as Editor from "../Editor";

import StreamImage from "assets/stream.jpg";
import { BsChevronDown, BsChevronUp, BsTrash } from "react-icons/bs";
import { useMemo, useState } from "react";
import { GiSparkyBomb } from "react-icons/gi";
import { Disclosure, Transition } from "@headlessui/react";
import { PresetFile } from "./FileItem";

export default function EditorFile(props: EditorFileProps) {
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const doesMatchFile = (file: any) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase());

  const presets: Record<string, any[]> = {
    "Classical Patterns": [],
    "Jazz Patterns": [],
    "Rock Patterns": [],
    "Drum Loops": [],
    "Custom Effects": [],
    "Original Etudes": [],
  };

  const categories = Object.keys(presets) as (keyof typeof presets)[];

  const openCategories = useMemo(() => {
    if (searchQuery === "") return categories;
    return categories.filter((category) =>
      presets[category].some((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  return (
    <Editor.Container>
      <Editor.Body>
        <Editor.Sidebar>
          <Editor.CardHeader>Preset Files</Editor.CardHeader>
          <Editor.SearchBox query={searchQuery} setQuery={setSearchQuery} />
          <Editor.List>
            {openCategories.map((category) => {
              const searching = searchQuery !== "";

              const isCategoryOpen = searching;

              const presetFiles = presets[category];
              const files = searching
                ? presetFiles.filter(doesMatchFile)
                : presetFiles;
              return (
                <Disclosure key={category}>
                  {({ open }) => {
                    const isOpen = isCategoryOpen || open;
                    return (
                      <>
                        <Disclosure.Button>
                          <div className="flex items-center justify-center text-slate-50">
                            <label
                              className={`font-nunito py-3 px-2 ${
                                open ? "font-extrabold" : "font-medium"
                              }`}
                            >
                              {category}
                            </label>
                            <span className="ml-auto mr-2">
                              {isOpen ? <BsChevronDown /> : <BsChevronUp />}
                            </span>
                          </div>
                        </Disclosure.Button>
                        <Disclosure.Panel static={isOpen}>
                          {files.map((file) => (
                            <PresetFile {...props} file={file} />
                          ))}
                        </Disclosure.Panel>
                      </>
                    );
                  }}
                </Disclosure>
              );
            })}
          </Editor.List>
        </Editor.Sidebar>
        <Editor.Content>
          <Editor.Title
            title={props.projectName}
            subtitle="Harmonia File (.ham))"
            color="bg-white"
            setTitle={props.setProjectName}
            editable
          />
          <Editor.ScoreContainer className="h-60 border-0.5 border-gray-500/50">
            <img src={StreamImage} alt="Stream" />
          </Editor.ScoreContainer>
          <Editor.Menu className="mt-6">
            <Editor.MenuGroup label="Save File" className="w-1/3 font-nunito">
              <div className="flex flex-col w-full py-4">
                <div className="flex">
                  <Editor.MenuButton
                    className="px-1 mx-3"
                    onClick={props.saveToAudio}
                  >
                    MBZ
                  </Editor.MenuButton>
                  <Editor.MenuButton
                    className="px-1 mx-3"
                    onClick={props.saveToAudio}
                  >
                    WEBM
                  </Editor.MenuButton>
                </div>
                <div className="flex w-full relative">
                  {props.isRecording ? (
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${props.recordingProgress}%` }}
                      ></div>
                    </div>
                  ) : null}
                </div>
              </div>
            </Editor.MenuGroup>
            <Editor.MenuGroup label="Load File" className="font-nunito w-1/3">
              <div className="flex mb-4 py-4">
                <Editor.MenuButton className="px-1" onClick={props.readFiles}>
                  MBZ
                </Editor.MenuButton>
              </div>
            </Editor.MenuGroup>
            <Editor.MenuGroup
              className="w-1/3"
              label={`${deleting ? "I Hope You Saved!" : "Clear File"}`}
            >
              <div className="flex relative py-4">
                <Editor.MenuButton
                  className={`transition-all duration-150 ease-in-out ${
                    deleting ? "text-slate-500 -translate-x-2" : "translate-x-0"
                  }`}
                  onClick={() => setDeleting(!deleting)}
                >
                  <BsTrash className="text-4xl" />
                </Editor.MenuButton>

                <Transition
                  show={deleting}
                  enter="transition-all duration-150 ease-in-out"
                  enterFrom="transform translate-x-0 opacity-0"
                  enterTo="transform translate-x-2 text-red-400 opacity-100"
                  leave="transition-all duration-150"
                  leaveFrom="transform translate-x-2 text-red-400 opacity-100"
                  leaveTo="transform translate-x-0 opacity-0"
                >
                  <GiSparkyBomb
                    className="text-4xl mt-2 cursor-pointer animate-pulse duration-75"
                    onClick={props.clearProject}
                  />
                </Transition>
              </div>
            </Editor.MenuGroup>
          </Editor.Menu>
        </Editor.Content>
      </Editor.Body>
    </Editor.Container>
  );
}
