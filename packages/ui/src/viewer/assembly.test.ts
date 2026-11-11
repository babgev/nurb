import { describe, expect, it } from "vitest"
import { Group, Mesh, Vector3 } from "three"
import { poseAssembly, type AssemblyJoint } from "./scene"

const joint: AssemblyJoint = { node: "joint0", param: "lid_open", name: "lid", origin: [2, 0, 0], dir: [0, 0, 1], lo: 0, hi: 180, at: 0 }

describe("assembly hinge preview", () => {
  it("rotates about its real pivot without accumulating slider changes", () => {
    const group = new Group()
    const lid = new Mesh()
    lid.name = "joint0"
    group.add(lid)
    poseAssembly(group, [joint], { lid_open: 90 })
    const first = new Vector3(3, 0, 0).applyMatrix4(lid.matrix)
    expect(first.x).toBeCloseTo(2)
    expect(first.y).toBeCloseTo(1)
    poseAssembly(group, [joint], { lid_open: 180 })
    poseAssembly(group, [joint], { lid_open: 90 })
    expect(new Vector3(3, 0, 0).applyMatrix4(lid.matrix).distanceTo(first)).toBeLessThan(1e-10)
    poseAssembly(group, [joint], {})
    expect(new Vector3(3, 0, 0).applyMatrix4(lid.matrix).x).toBeCloseTo(3)
  })

  it("uses the build's existing angle as the zero of the preview", () => {
    const group = new Group()
    const lid = new Mesh(); lid.name = "joint0"; group.add(lid)
    poseAssembly(group, [{ ...joint, at: 70 }], { lid_open: 70 })
    expect(new Vector3(3, 0, 0).applyMatrix4(lid.matrix).x).toBeCloseTo(3)
  })
})
