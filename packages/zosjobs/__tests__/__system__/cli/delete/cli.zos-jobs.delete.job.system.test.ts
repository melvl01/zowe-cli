/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

import { ITestEnvironment } from "./../../../../../../__tests__/__src__/environment/doc/response/ITestEnvironment";
import { TestEnvironment } from "./../../../../../../__tests__/__src__/environment/TestEnvironment";
import { runCliScript } from "./../../../../../../__tests__/__src__/TestUtils";
import * as fs from "fs";

// Test Environment populated in the beforeAll();
let TEST_ENVIRONMENT: ITestEnvironment;
let IEFBR14_JCL: string;

describe("zos-jobs delete job command", () => {
    // Create the unique test environment
    beforeAll(async () => {
        TEST_ENVIRONMENT = await TestEnvironment.setUp({
            testName: "zos_jobs_delete_job_command",
            tempProfileTypes: ["zosmf"]
        });
        IEFBR14_JCL = TEST_ENVIRONMENT.systemTestProperties.zosjobs.iefbr14Member;
    });

    describe("help", () => {
        it("should not have changed", async () => {
            const response = runCliScript(__dirname + "/__scripts__/job/help.sh", TEST_ENVIRONMENT);
            expect(response.stderr.toString()).toBe("");
            expect(response.status).toBe(0);
            expect(response.stdout.toString()).toMatchSnapshot();
        });
    });

    describe("error handling", () => {
        it("should display an error when jobid is missing", () => {
            const response = runCliScript(__dirname + "/__scripts__/job/missing_jobid.sh", TEST_ENVIRONMENT);
            expect(response.status).toBe(1);
            expect(response.stdout.toString()).toBe("");
            expect(response.stderr.toString()).toMatchSnapshot();
        });

        it("should surface an error from z/OSMF if the jobid doesn't exist", () => {
            const response = runCliScript(__dirname + "/__scripts__/job/not_found.sh", TEST_ENVIRONMENT);
            expect(response.status).toBe(1);
            expect(response.stdout.toString()).toBe("");
            expect(response.stderr.toString()).toContain("Command Error:");
            expect(response.stderr.toString()).toContain("Obtaining job info for a single job id JOB00000 on");
            expect(response.stderr.toString()).toContain("failed: Job not found");
        });
    });

    describe("successful scenario", () => {
        it("should delete a job", () => {
            const response = runCliScript(__dirname + "/__scripts__/job/delete_job.sh",
                TEST_ENVIRONMENT, [IEFBR14_JCL]);
            expect(response.status).toBe(0);
            expect(response.stderr.toString()).toBe("");
            expect(response.stdout.toString()).toContain("Successfully deleted job");
        });
    });
});
