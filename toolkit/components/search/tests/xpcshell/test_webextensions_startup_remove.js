/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

const ENGINE_ID = "enginetest@example.com";
let xpi;
let profile = do_get_profile().clone();

AddonTestUtils.init(this, false);
AddonTestUtils.createAppInfo(
  "xpcshell@tests.mozilla.org",
  "xpcshell",
  "42",
  "42"
);

add_setup(async function () {
  SearchTestUtils.setRemoteSettingsConfig([{ identifier: "appDefault" }]);

  xpi = AddonTestUtils.createTempWebExtensionFile({
    manifest: {
      version: "1.0",
      browser_specific_settings: {
        gecko: { id: ENGINE_ID },
      },
      chrome_settings_overrides: {
        search_provider: {
          name: "Test Engine",
          search_url: `https://example.com/?q={searchTerms}`,
        },
      },
    },
  });
  await AddonTestUtils.manuallyInstall(xpi);
});

add_task(async function test_removeAddonOnStartup() {
  let promise = promiseAfterSettings();
  await SearchTestUtils.initXPCShellAddonManager();
  await Services.search.init();

  let engine = Services.search.getEngineByName("Test Engine");
  let allEngines = await Services.search.getEngines();

  Assert.ok(!!engine, "Should have installed the test engine");

  await Services.search.setDefault(
    engine,
    Ci.nsISearchService.CHANGE_REASON_UNKNOWN
  );
  await promise;

  await AddonTestUtils.promiseShutdownManager();

  // Now remove it, reset the search service and start up the add-on manager.
  // Note: the saved settings will have the engine in. If this didn't work,
  // the engine would still be present.
  await IOUtils.remove(
    PathUtils.join(profile.path, "extensions", `${ENGINE_ID}.xpi`)
  );

  let removePromise = SearchTestUtils.promiseSearchNotification(
    SearchUtils.MODIFIED_TYPE.REMOVED,
    SearchUtils.TOPIC_ENGINE_MODIFIED
  );
  Services.search.wrappedJSObject.reset();
  await AddonTestUtils.promiseStartupManager();
  await Services.search.init();
  await removePromise;

  Assert.ok(
    !Services.search.getEngineByName("Test Engine"),
    "Should have removed the test engine"
  );

  let newEngines = await Services.search.getEngines();
  Assert.deepEqual(
    newEngines.map(e => e.name),
    allEngines.map(e => e.name).filter(n => n != "Test Engine"),
    "Should no longer have the test engine in the full list"
  );
  let newDefault = await Services.search.getDefault();
  Assert.equal(
    newDefault.name,
    "appDefault",
    "Should have changed the default engine back to the configuration default"
  );

  await AddonTestUtils.promiseShutdownManager();
});
