package Classes;

import android.media.AudioManager;
import android.media.ToneGenerator;
import android.content.Context;

import com.zebra.rfid.api3.BEEPER_VOLUME;

import java.util.Timer;
import java.util.TimerTask;


public class Beeper {
    final static String TAG = "BEEPER";

    private static Context mContext;
    public static ToneGenerator toneGenerator;
    private static BEEPER_VOLUME beeperVolume;


    private static final int BEEP_DELAY_TIME_MIN = 0;
    private static final int BEEP_DELAY_TIME_MAX = 300;
    private static boolean beepON = false;
    private static boolean beepONLocate = false;
    public static Timer locatebeep;
    public static Timer tbeep;

    public Beeper(Context mContext) {
        Beeper.mContext = mContext;
    }

    public static int setBeeperSettings(int volume) {
        try {

            int streamType = AudioManager.STREAM_DTMF;
            int percentageVolume = -1;

            // if (volume == 0) {
            if (volume == 3) {
                beeperVolume = BEEPER_VOLUME.HIGH_BEEP;
                percentageVolume = 100;
            }
            // else if (volume == 1) {
            else if (volume == 2) {
                beeperVolume = BEEPER_VOLUME.MEDIUM_BEEP;
                percentageVolume = 75;
            }
            // else if (volume == 2) {
            else if (volume == 1) {
                beeperVolume = BEEPER_VOLUME.LOW_BEEP;
                percentageVolume = 50;
            }
            // else if (volume == 3) {
            else if (volume == 0) {
                beeperVolume = BEEPER_VOLUME.QUIET_BEEP;
                percentageVolume = 0;
            }

            if (percentageVolume == -1) {
              throw new Exception("Invalid volume detected.");
            }

            toneGenerator = new ToneGenerator(streamType, percentageVolume);

            return percentageVolume;

        } catch (Exception e) {
            e.printStackTrace();
        }
      return volume;
    }

    public static int getBeeperVolume() {
        return Integer.parseInt(String.valueOf(beeperVolume));
    }

    public static void stopLocateBeeping() {
        toneGenerator.stopTone();
    }

    public static void startLocateBeeping(int proximity) {

        int POLLING_INTERVAL1 = BEEP_DELAY_TIME_MIN + (((BEEP_DELAY_TIME_MAX - BEEP_DELAY_TIME_MIN) * (100 - proximity)) / 100);

        if (!beepONLocate) {
            beepONLocate = true;

            /* beep */
            int toneType = ToneGenerator.TONE_PROP_BEEP;
            toneGenerator.startTone(toneType);

            if (locatebeep == null) {
                TimerTask task = new TimerTask() {
                    @Override
                    public void run() {
                        if (locatebeep != null) {
                            toneGenerator.stopTone();
                            locatebeep.cancel();
                            locatebeep.purge();
                        }
                        locatebeep = null;
                        beepONLocate = false;
                    }
                };
                locatebeep = new Timer();
                locatebeep.schedule(task, POLLING_INTERVAL1, 10);
            }
        }
    }

    public static void startBeepingTimer() {
        if (beeperVolume != BEEPER_VOLUME.QUIET_BEEP) {
            if (!beepON) {
                beepON = true;
                beep();
                if (tbeep == null) {
                    TimerTask task = new TimerTask() {
                        @Override
                        public void run() {
                            stopBeepingTimer();
                            beepON = false;
                        }
                    };
                    tbeep = new Timer();
                    tbeep.schedule(task, 10); // delay for 10ms
                }
            }
        }
    }

    public static void stopBeepingTimer() {
        if (tbeep != null) {
            toneGenerator.stopTone();
            tbeep.cancel();
            tbeep.purge();
        }
        tbeep = null;
    }

    public static void beep() {
        int toneType = ToneGenerator.TONE_PROP_BEEP;
        toneGenerator.startTone(toneType);
    }
}
