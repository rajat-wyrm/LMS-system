import { useEffect, useState } from "react";

interface AudioAnalyserResult {
  volume: number;
  isAudioAvailable: boolean;
}

interface AudioPipeline {
  audioContext: AudioContext;
  analyser: AnalyserNode;
}

const audioPipelines = new WeakMap<HTMLMediaElement, AudioPipeline>();

const useAudioAnalyser = (
  mediaElement: HTMLMediaElement | null
): AudioAnalyserResult => {
  const [volume, setVolume] = useState(0);
  const [isAudioAvailable, setIsAudioAvailable] = useState(false);

  useEffect(() => {
    if (!mediaElement) {
      setVolume(0);
      setIsAudioAvailable(false);
      return;
    }

    let animationFrameId = 0;
    let isMounted = true;

    const stopDetection = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;

      if (isMounted) {
        setVolume(0);
      }
    };

    const startAnalyser = async () => {
      try {
        let pipeline = audioPipelines.get(mediaElement);

        if (!pipeline) {
          const audioContext = new AudioContext();

          const source =
            audioContext.createMediaElementSource(mediaElement);

          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;

          source.connect(analyser);
          analyser.connect(audioContext.destination);

          pipeline = { audioContext, analyser };
          audioPipelines.set(mediaElement, pipeline);
        }

        const { audioContext, analyser } = pipeline;

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        if (!isMounted) return;

        setIsAudioAvailable(true);

        const dataArray = new Uint8Array(analyser.fftSize);
        const detectAudio = () => {
          if (!isMounted) return;

          analyser.getByteTimeDomainData(dataArray);

          let sum = 0;

          for (const value of dataArray) {
            const normalizedValue = (value - 128) / 128;
            sum += normalizedValue * normalizedValue;
          }

          const rms = Math.sqrt(sum / dataArray.length);

          setVolume(Math.min(1, rms * 4));

          animationFrameId = requestAnimationFrame(detectAudio);
        };

        stopDetection();
        detectAudio();

      } catch (error) {
        console.error("Audio analyser could not start:", error);

        if (isMounted) {
          setIsAudioAvailable(false);
          setVolume(0);
        }
      }
    };

    const handlePlay = () => {
      void startAnalyser();
    };

    const handlePause = () => {
      stopDetection();
    };

    mediaElement.addEventListener("play", handlePlay);
    mediaElement.addEventListener("pause", handlePause);
    mediaElement.addEventListener("ended", handlePause);

    if (!mediaElement.paused) {
      void startAnalyser();
    }

    return () => {
      isMounted = false;

      cancelAnimationFrame(animationFrameId);

      mediaElement.removeEventListener("play", handlePlay);
      mediaElement.removeEventListener("pause", handlePause);
      mediaElement.removeEventListener("ended", handlePause);
    };
  }, [mediaElement]);

  return { volume, isAudioAvailable };
};

export default useAudioAnalyser;