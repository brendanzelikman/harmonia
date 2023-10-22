import { Transition } from "@headlessui/react";
import { ProjectComponent } from "components/Project";
import Demo1 from "assets/demos/demo.ham";

export function Demos() {
  const demos = [Demo1];

  // Display the list of demos
  const DemoList = () => (
    <div className="my-8 w-full h-full space-y-8">
      {demos.map((path, index) => (
        <ProjectComponent key={path} filePath={path} index={index} />
      ))}
    </div>
  );

  return (
    <Transition
      show
      appear
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="w-full h-full"
    >
      <DemoList />
    </Transition>
  );
}
