package ru.ruslan.spring.diplom.dto;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import ru.ruslan.spring.diplom.enums.UserRole;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@Getter
@Setter
public class UserDTO {

    @NotEmpty
    private String username;

    @NotEmpty
    private String password;

    @Email
    private String email;

    @Enumerated(EnumType.STRING)
    @NotNull
    private UserRole role;
}
