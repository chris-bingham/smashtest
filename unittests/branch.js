const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const assert = chai.assert;
const util = require('util');
const Step = require('../step.js');
const Branch = require('../branch.js');

chai.use(chaiSubset);

describe("Branch", function() {
    describe("mergeToEnd()", function() {
        it("merges one branch to the end of another branch", function() {
            var stepA = new Step();
            stepA.text = "A";

            var stepB = new Step();
            stepB.text = "B";

            var stepC = new Step();
            stepC.text = "C";

            var branch1 = new Branch;
            branch1.steps = [ stepA ];

            var branch2 = new Branch;
            branch2.steps = [ stepB, stepC ];

            branch1.mergeToEnd(branch2);

            expect(branch1).to.containSubset({
                steps: [
                    { text: "A" },
                    { text: "B" },
                    { text: "C" }
                ]
            });

            expect(branch1.steps.length).to.equal(3);
            expect(branch2.steps.length).to.equal(2);
        });
    });

    describe("clone()", function() {
        it("clones an empty branch", function() {
            var branch = new Branch();
            var clonedBranch = branch.clone();

            expect(clonedBranch).to.containSubset({
                steps: [],
                prevSequentialBranch: undefined,
                afterBranches: undefined,
                frequency: undefined
            });

            expect(branch.steps).to.have.lengthOf(0);
        });

        it("clones a branch with steps", function() {
            var stepA = new Step();
            stepA.text = "A";

            var stepB = new Step();
            stepB.text = "B";

            var branch = new Branch();
            branch.steps = [ stepA, stepB ];

            var clonedBranch = branch.clone();

            expect(clonedBranch).to.containSubset({
                steps: [
                    { text: "A" },
                    { text: "B" }
                ],
                prevSequentialBranch: undefined,
                afterBranches: undefined,
                frequency: undefined
            });

            expect(clonedBranch.steps).to.have.lengthOf(2);

            expect(branch).to.containSubset({
                steps: [
                    { text: "A" },
                    { text: "B" }
                ],
                prevSequentialBranch: undefined,
                afterBranches: undefined,
                frequency: undefined
            });

            expect(branch.steps).to.have.lengthOf(2);
        });

        it("clones a branch with all member vars set", function() {
            var stepA = new Step();
            stepA.text = "A";

            var stepB = new Step();
            stepB.text = "B";

            var stepC = new Step();
            stepC.text = "C";

            var stepD = new Step();
            stepD.text = "D";

            var stepE = new Step();
            stepE.text = "E";

            var stepF = new Step();
            stepF.text = "F";

            var prevSequentialBranch = new Branch();
            prevSequentialBranch.steps = [ stepC ];

            var afterBranch1 = new Branch();
            afterBranch1.steps = [ stepD, stepE ];

            var afterBranch2 = new Branch();
            afterBranch2.steps = [ stepF ];

            var branch = new Branch();
            branch.steps = [ stepA, stepB ];
            branch.prevSequentialBranch = prevSequentialBranch;
            branch.afterBranches = [ afterBranch1, afterBranch2 ];
            branch.frequency = 'high';

            var clonedBranch = branch.clone();

            expect(clonedBranch).to.containSubset({
                steps: [
                    { text: "A" },
                    { text: "B" }
                ],
                prevSequentialBranch: {
                    steps: [
                        { text: "C" }
                    ]
                },
                afterBranches: [
                    {
                        steps: [
                            { text: "D" },
                            { text: "E" }
                        ]
                    },
                    {
                        steps: [
                            { text: "F" }
                        ]
                    }
                ],
                frequency: 'high'
            });

            expect(clonedBranch.steps).to.have.lengthOf(2);

            expect(branch).to.containSubset({
                steps: [
                    { text: "A" },
                    { text: "B" }
                ],
                prevSequentialBranch: {
                    steps: [
                        { text: "C" }
                    ]
                },
                afterBranches: [
                    {
                        steps: [
                            { text: "D" },
                            { text: "E" }
                        ]
                    },
                    {
                        steps: [
                            { text: "F" }
                        ]
                    }
                ],
                frequency: 'high'
            });

            expect(branch.steps).to.have.lengthOf(2);
        });
    });
});
