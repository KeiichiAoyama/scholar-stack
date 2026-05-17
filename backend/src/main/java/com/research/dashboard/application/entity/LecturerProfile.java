package com.research.dashboard.application.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lecturer_profiles")
public class LecturerProfile {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false, unique = true)
	private AppUser user;
	private String nik;
	private String gender;
	private String placeOfBirth;
	private String dateOfBirth;
	private String religion;
	private String employmentType;
	private String employeeStatus;
	private String pangkat;
	private String golongan;
	private String jabatanFungsional;
	private String prodi;
	private Integer sintaScoreOverall = 0;
	private Integer sintaScore3yr = 0;
	private Integer affilScore = 0;
	private Integer affilScore3yr = 0;
	public Long getId() { return id; } public void setId(Long id) { this.id = id; }
	public AppUser getUser() { return user; } public void setUser(AppUser user) { this.user = user; }
	public String getNik() { return nik; } public void setNik(String nik) { this.nik = nik; }
	public String getGender() { return gender; } public void setGender(String gender) { this.gender = gender; }
	public String getPlaceOfBirth() { return placeOfBirth; } public void setPlaceOfBirth(String placeOfBirth) { this.placeOfBirth = placeOfBirth; }
	public String getDateOfBirth() { return dateOfBirth; } public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
	public String getReligion() { return religion; } public void setReligion(String religion) { this.religion = religion; }
	public String getEmploymentType() { return employmentType; } public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
	public String getEmployeeStatus() { return employeeStatus; } public void setEmployeeStatus(String employeeStatus) { this.employeeStatus = employeeStatus; }
	public String getPangkat() { return pangkat; } public void setPangkat(String pangkat) { this.pangkat = pangkat; }
	public String getGolongan() { return golongan; } public void setGolongan(String golongan) { this.golongan = golongan; }
	public String getJabatanFungsional() { return jabatanFungsional; } public void setJabatanFungsional(String jabatanFungsional) { this.jabatanFungsional = jabatanFungsional; }
	public String getProdi() { return prodi; } public void setProdi(String prodi) { this.prodi = prodi; }
	public Integer getSintaScoreOverall() { return sintaScoreOverall; } public void setSintaScoreOverall(Integer sintaScoreOverall) { this.sintaScoreOverall = sintaScoreOverall; }
	public Integer getSintaScore3yr() { return sintaScore3yr; } public void setSintaScore3yr(Integer sintaScore3yr) { this.sintaScore3yr = sintaScore3yr; }
	public Integer getAffilScore() { return affilScore; } public void setAffilScore(Integer affilScore) { this.affilScore = affilScore; }
	public Integer getAffilScore3yr() { return affilScore3yr; } public void setAffilScore3yr(Integer affilScore3yr) { this.affilScore3yr = affilScore3yr; }
}
