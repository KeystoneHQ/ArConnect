import React, { useEffect, useState } from "react";

const Permission = () => {
  const init = async () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      window.close();
    });
  };

  useEffect(() => {
    init();
  }, []);

  return <div>Permission Page</div>;
};

export default Permission;
