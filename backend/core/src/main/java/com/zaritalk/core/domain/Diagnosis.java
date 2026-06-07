package com.zaritalk.core.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "diagnosis")
public class Diagnosis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_pk", nullable = false)
    private Long userPk;

    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "input_json", columnDefinition = "TEXT")
    private String inputJson;

    @Column(name = "result_json", columnDefinition = "TEXT")
    private String resultJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static Diagnosis create(Long userPk, String type, String inputJson, String resultJson) {
        Diagnosis d = new Diagnosis();
        d.userPk     = userPk;
        d.type       = type;
        d.inputJson  = inputJson;
        d.resultJson = resultJson;
        d.createdAt  = LocalDateTime.now();
        return d;
    }

    public Long getId()              { return id; }
    public Long getUserPk()          { return userPk; }
    public String getType()          { return type; }
    public String getInputJson()     { return inputJson; }
    public String getResultJson()    { return resultJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
