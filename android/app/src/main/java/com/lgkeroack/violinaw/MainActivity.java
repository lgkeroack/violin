package com.lgkeroack.violinaw;

import android.media.AudioManager;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hardware volume buttons control media volume (guide melody / backing).
        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        // Keep the screen awake while practising.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Allow Web Audio to start without an extra tap.
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebSettings settings = getBridge().getWebView().getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }
}
