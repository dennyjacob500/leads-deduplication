const { deduplicate } = require("../src/dedupe");

describe("deduplication", () => {
  it("handles empty dataset", () => {
    const { dedupedLeads, auditTrail } = deduplicate([]);
    expect(dedupedLeads.length).toBe(0);
    expect(auditTrail.length).toBe(0);
  });

  it("deduplicates by _id preferring newest", () => {
    const sample = [
      { _id: "1", email: "a@b.com", firstName: "A", lastName: "X", address: "Addr1", entryDate: "2020-01-01T10:00:00Z" },
      { _id: "1", email: "a@b.com", firstName: "A", lastName: "Y", address: "Addr2", entryDate: "2020-01-02T10:00:00Z" }
    ];
    const { dedupedLeads } = deduplicate(sample);
    expect(dedupedLeads.find(r => r._id === "1").lastName).toBe("Y");
  });

  it("deduplicates by email preferring newest", () => {
    const sample = [
      { _id: "2", email: "c@d.com", firstName: "C", lastName: "Z", address: "Addr3", entryDate: "2020-01-01T10:00:00Z" },
      { _id: "3", email: "c@d.com", firstName: "D", lastName: "W", address: "Addr4", entryDate: "2020-01-03T10:00:00Z" }
    ];
    const { dedupedLeads } = deduplicate(sample);
    expect(dedupedLeads.find(r => r.email === "c@d.com").firstName).toBe("D");
  });

  it("tie on date prefers later in list", () => {
    const tie = [
      { _id: "9", email: "x@y.com", firstName: "Old", lastName: "One", address: "A", entryDate: "2021-01-01T00:00:00Z" },
      { _id: "9", email: "x@y.com", firstName: "New", lastName: "Two", address: "B", entryDate: "2021-01-01T00:00:00Z" }
    ];
    const { dedupedLeads } = deduplicate(tie);
    expect(dedupedLeads.find(r => r._id === "9").firstName).toBe("New");
  });

  it("multiple duplicates with identical timestamps resolves to last record", () => {
    const sample = [
      { _id: "10", email: "dup@test.com", firstName: "First", lastName: "One", address: "Addr1", entryDate: "2022-01-01T00:00:00Z" },
      { _id: "10", email: "dup@test.com", firstName: "Second", lastName: "Two", address: "Addr2", entryDate: "2022-01-01T00:00:00Z" },
      { _id: "10", email: "dup@test.com", firstName: "Third", lastName: "Three", address: "Addr3", entryDate: "2022-01-01T00:00:00Z" }
    ];
    const { dedupedLeads } = deduplicate(sample);
    expect(dedupedLeads.find(r => r._id === "10").firstName).toBe("Third");
  });

  it("conflicting _id vs email resolves consistently", () => {
    const sample = [
      { _id: "11", email: "conflict@test.com", firstName: "Alpha", lastName: "One", address: "Addr1", entryDate: "2022-01-01T00:00:00Z" },
      { _id: "11", email: "other@test.com", firstName: "Beta", lastName: "Two", address: "Addr2", entryDate: "2022-01-02T00:00:00Z" },
      { _id: "12", email: "conflict@test.com", firstName: "Gamma", lastName: "Three", address: "Addr3", entryDate: "2022-01-03T00:00:00Z" }
    ];
    const { dedupedLeads } = deduplicate(sample);
    // Latest record by date wins, even if conflict between id and email
    expect(dedupedLeads.find(r => r.email === "conflict@test.com").firstName).toBe("Gamma");
  });
});