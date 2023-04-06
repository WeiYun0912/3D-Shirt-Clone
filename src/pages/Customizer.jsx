import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import config from "../config/config";
import state from "../store";
import { reader } from "../config/helpers";
import { EditorTabs, FilterTabs, DecalTypes } from "../config/constants";
import { fadeAnimation, slideAnimation } from "../config/motion";
import {
  AIPicker,
  ColorPicker,
  CustomButton,
  FilePicker,
  Tab,
} from "../components";
import { useSnapshot } from "valtio";

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState("");

  const [prompt, setPrompt] = useState("");

  const [generatingImg, setGeneratingImg] = useState(false);

  const [activeEditorTab, setActiveEditorTab] = useState({
    show: false,
    tabName: "",
  });

  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  });

  //show tab content
  const generateTabContent = (tab) => {
    switch (activeEditorTab.tabName) {
      case "colorpicker":
        return activeEditorTab.show && <ColorPicker />;
      case "filepicker":
        return (
          activeEditorTab.show && (
            <FilePicker file={file} setFile={setFile} readFile={readFile} />
          )
        );
      case "aipicker":
        return (
          activeEditorTab.show && (
            <AIPicker
              prompt={prompt}
              setPrompt={setPrompt}
              generatingImg={generatingImg}
              handleSubmit={handleSubmit}
            />
          )
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt) return alert("Please enter a prompt");

    try {
      setGeneratingImg(true);

      const response = await fetch(config.production.backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();

      handelDecals(type, `data:image/png;base64,${data.photo}`);
    } catch (error) {
      alert(error.message);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  };

  const handelDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    // after setting state

    setActiveFilterTab((prev) => {
      return {
        ...prev,
        [tabName]: !prev[tabName],
      };
    });
  };

  const readFile = (type) => {
    reader(file).then((result) => {
      handelDecals(type, result);
      setActiveEditorTab({
        show: false,
        tabName: "",
      });
    });
  };

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation("left")}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => {
                      // setShow((prev) => !prev);
                      setActiveEditorTab((prev) => ({
                        tabName: tab.name,
                        show: !prev.show,
                      }));
                    }}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => (state.intro = true)}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>

          <motion.div
            className="filtertabs-container"
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                tab={tab}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customizer;
