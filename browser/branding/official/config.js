// This file is used to store custom preferences when building from Firefox
//
// Disabling Telemetry and Data Collection
//
// Browser
defaultPref("browser.newtabpage.activity-stream.feeds.telemetry", false);
defaultPref("browser.newtabpage.activity-stream.telemetry", false);
defaultPref("browser.ping-centre.telemetry", false);
//
// Data Reporting
defaultPref("datareporting.healthreport.service.enabled", false);
defaultPref("datareporting.healthreport.uploadEnabled", false);
defaultPref("datareporting.policy.dataSubmissionEnabled", false);
defaultPref("datareporting.sessions.current.clean", true);
//
// Dev Tools
defaultPref("devtools.onboarding.telemetry.logged", false);

// Toolkit
defaultPref("toolkit.telemetry.archive.enabled", false);
defaultPref("toolkit.telemetry.bhrPing.enabled", false);
defaultPref("toolkit.telemetry.enabled", false);
defaultPref("toolkit.telemetry.firstShutdownPing.enabled", false);
defaultPref("toolkit.telemetry.hybridContent.enabled", false);
defaultPref("toolkit.telemetry.newProfilePing.enabled", false);
defaultPref("toolkit.telemetry.prompted", 2);
defaultPref("toolkit.telemetry.rejected", true);
defaultPref("toolkit.telemetry.reportingpolicy.firstRun", false);
defaultPref("toolkit.telemetry.server", );
defaultPref("toolkit.telemetry.shutdownPingSender.enabled", false);
defaultPref("toolkit.telemetry.unified", false);
defaultPref("toolkit.telemetry.unifiedIsOptIn", false);
defaultPref("toolkit.telemetry.updatePing.enabled", false);

// Enabling Enhanced Tracking Protection
//
// Privacy
defaultPref("privacy.trackingprotectoin.enabled", true);
defaultPref("privacy.trackingprotection.pbmode.enabled", true);
defaultPref("privacy.trackingprotection.fingerprinting.enabled", true);
defaultPref("privacy.trackingprotection.cryptomining.enabled", true);
defaultPref("privacy.trackingprotection.socialtracking.enabled", true);

// Network
defaultPref("network.cookie.cookieBehavior", 2);
